/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storageService } from './storageService';
import {
  AbdmSyncPayload,
  AbdmSyncResponse,
  SyncStatusState,
  StructuredClinicalSummary,
  PatientProfile,
} from '../types';
import { useEffect, useState, useCallback } from 'react';

type SyncListener = (state: SyncStatusState) => void;

class BackgroundSyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private lastSyncedAt: string | null = null;
  private pendingCount: number = 0;
  private syncedCount: number = 0;
  private failedCount: number = 0;
  private lastError: string | null = null;
  private lastTxnId: string | null = null;
  private activeGateway: string = 'https://dev.abdm.gov.in/gateway/v0.5';
  private syncTimer: any = null;
  private debounceTimer: any = null;
  private listeners: Set<SyncListener> = new Set();
  private autoSyncIntervalMs: number = 45000; // 45 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      this.initNetworkListeners();
      this.startBackgroundLoop();
      // Initial count check
      this.refreshPendingCount();
    }
  }

  /**
   * Register online / offline event handlers
   */
  private initNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[SyncService] Device is ONLINE. Triggering ABDM cloud synchronization...');
      this.isOnline = true;
      this.lastError = null;
      this.notifyListeners();
      // Immediately trigger sync upon network reconnection
      this.syncNow({ force: false });
    });

    window.addEventListener('offline', () => {
      console.warn('[SyncService] Device is OFFLINE. Local IndexedDB caching active.');
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Start recurring background synchronization worker
   */
  public startBackgroundLoop() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncNow({ silent: true });
      }
    }, this.autoSyncIntervalMs);
  }

  /**
   * Stop background synchronization worker
   */
  public stopBackgroundLoop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Subscribe to sync state changes
   */
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current state snapshot
   */
  public getState(): SyncStatusState {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
      pendingCount: this.pendingCount,
      syncedCount: this.syncedCount,
      failedCount: this.failedCount,
      lastError: this.lastError,
      lastTxnId: this.lastTxnId,
      activeGateway: this.activeGateway,
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('[SyncService] Listener notification error:', err);
      }
    });
  }

  /**
   * Recalculate pending records in IndexedDB
   */
  public async refreshPendingCount(): Promise<number> {
    try {
      const unsynced = await storageService.getUnsyncedRecords();
      this.pendingCount = unsynced.totalPending;
      this.notifyListeners();
      return this.pendingCount;
    } catch (err) {
      console.warn('[SyncService] Failed to refresh pending count:', err);
      return 0;
    }
  }

  /**
   * Debounced sync trigger for UI actions (e.g. after adding a patient or generating summary)
   */
  public triggerDebouncedSync(delayMs: number = 2000) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.syncNow({ silent: false });
    }, delayMs);
  }

  /**
   * Execute full synchronization push to ABDM Sandbox / Cloud FHIR server
   */
  public async syncNow(options: { force?: boolean; silent?: boolean } = {}): Promise<{
    success: boolean;
    syncedCount: number;
    transactionId?: string;
    error?: string;
  }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, error: 'Sync is already in progress' };
    }

    if (!this.isOnline && !options.force) {
      this.lastError = 'Device is offline. Records are safely queued in local IndexedDB.';
      this.notifyListeners();
      return { success: false, syncedCount: 0, error: this.lastError };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notifyListeners();

    try {
      // 1. Fetch all unsynced records from local IndexedDB
      const unsynced = await storageService.getUnsyncedRecords();
      this.pendingCount = unsynced.totalPending;

      if (unsynced.totalPending === 0) {
        this.isSyncing = false;
        this.lastSyncedAt = new Date().toISOString();
        this.notifyListeners();
        return {
          success: true,
          syncedCount: 0,
          transactionId: this.lastTxnId || undefined,
        };
      }

      // 2. Prepare standardized ABDM Sync Payload with HL7 FHIR structures
      const payload: AbdmSyncPayload = {
        kioskId: 'KIOSK-AIIMS-DEL-01',
        facilityId: 'FAC-NDHM-9019',
        hipId: 'IN-HIP-AIIMS-NDHM-0881',
        syncedAt: new Date().toISOString(),
        records: {
          patients: unsynced.patients,
          clinicalSummaries: unsynced.clinicalSummaries,
          queue: unsynced.queue,
          documents: unsynced.documents,
        },
      };

      // 3. Push to ABDM FHIR Cloud Gateway
      const response = await fetch('/api/abdm/sync-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ABDM-HIP-ID': payload.hipId,
          'X-ABDM-CLIENT-TIMESTAMP': payload.syncedAt,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`ABDM Gateway returned HTTP ${response.status}: ${response.statusText}`);
      }

      const syncResult: AbdmSyncResponse = await response.json();

      if (!syncResult.success) {
        throw new Error(syncResult.message || 'ABDM Cloud FHIR synchronization failed');
      }

      // 4. Update local IndexedDB records to mark them as synced
      await storageService.markBatchAsSynced({
        syncedAt: syncResult.ndhmGatewayTimestamp || new Date().toISOString(),
        abdmTxnId: syncResult.transactionId,
        patientAbhas: unsynced.patients.map((p) => p.abhaId),
        summaryAbhas: unsynced.clinicalSummaries.map((s) => s.abhaId),
        queueIds: unsynced.queue.map((q) => q.id),
        documentIds: unsynced.documents.map((d) => d.id),
        fhirBundleUris: syncResult.fhirBundleUris,
      });

      // 5. Update local service state
      this.lastSyncedAt = syncResult.ndhmGatewayTimestamp;
      this.lastTxnId = syncResult.transactionId;
      this.syncedCount += unsynced.totalPending;
      this.pendingCount = 0;
      this.isSyncing = false;
      this.lastError = null;
      this.notifyListeners();

      return {
        success: true,
        syncedCount: unsynced.totalPending,
        transactionId: syncResult.transactionId,
      };
    } catch (err: any) {
      console.error('[SyncService] Cloud sync push failed:', err);
      this.isSyncing = false;
      this.failedCount++;
      this.lastError = err.message || 'Failed to sync with ABDM cloud server';
      this.notifyListeners();

      return {
        success: false,
        syncedCount: 0,
        error: this.lastError,
      };
    }
  }

  /**
   * Helper to verify ABDM Sandbox Health
   */
  public async checkSandboxHealth(): Promise<any> {
    try {
      const res = await fetch('/api/abdm/sandbox-status');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('ABDM sandbox check error:', e);
    }
    return null;
  }
}

// Global Singleton Instance
export const syncService = new BackgroundSyncService();

/**
 * Custom React Hook for consuming background sync state in components
 */
export function useBackgroundSync() {
  const [state, setState] = useState<SyncStatusState>(syncService.getState());

  useEffect(() => {
    const unsubscribe = syncService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  const manualSync = useCallback(async () => {
    return await syncService.syncNow({ force: true });
  }, []);

  const triggerDebouncedSync = useCallback((delayMs?: number) => {
    syncService.triggerDebouncedSync(delayMs);
  }, []);

  return {
    ...state,
    manualSync,
    triggerDebouncedSync,
    checkSandboxHealth: () => syncService.checkSandboxHealth(),
  };
}

export default syncService;
