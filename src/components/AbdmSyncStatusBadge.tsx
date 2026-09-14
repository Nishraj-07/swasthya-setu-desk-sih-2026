/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  X,
} from 'lucide-react';
import { useBackgroundSync } from '../services/syncService';

export const AbdmSyncStatusBadge: React.FC = () => {
  const {
    isOnline,
    isSyncing,
    lastSyncedAt,
    pendingCount,
    syncedCount,
    lastError,
    lastTxnId,
    activeGateway,
    manualSync,
  } = useBackgroundSync();

  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTriggerSync = async () => {
    setFeedback('Initiating ABDM FHIR cloud synchronization...');
    const res = await manualSync();
    if (res.success) {
      setFeedback(
        res.syncedCount > 0
          ? `Successfully synchronized ${res.syncedCount} records with ABDM Sandbox!`
          : 'All local IndexedDB records are already up to date with cloud FHIR repository.'
      );
    } else {
      setFeedback(`Sync failed: ${res.error}`);
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Interactive Status Badge Button */}
      <button
        id="abdm-sync-status-badge"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-2xs select-none ${
          !isOnline
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            : isSyncing
            ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-200 animate-pulse'
            : pendingCount > 0
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            : 'bg-stone-100/90 text-stone-700 border-stone-200 hover:bg-stone-200/80'
        }`}
        title="ABDM Cloud FHIR Sync Status"
      >
        {/* Status Icon */}
        {!isOnline ? (
          <CloudOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        ) : isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
        ) : pendingCount > 0 ? (
          <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#52833C] shrink-0" />
        )}

        {/* Short Label */}
        <span className="hidden md:inline font-bold">
          {!isOnline ? 'Offline' : isSyncing ? 'Syncing...' : 'ABDM Sync'}
        </span>

        {/* Pending Badge Counter */}
        {pendingCount > 0 ? (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white animate-bounce">
            {pendingCount}
          </span>
        ) : (
          <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#52833C]"></span>
        )}

        <ChevronDown className="w-3 h-3 text-stone-400" />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 p-4 text-stone-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#52833C]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    ABDM Cloud FHIR Sync
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Ayushman Bharat Digital Mission (M1/M2/M3)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Status Banner */}
            <div className="my-3 p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold bg-stone-50 border-stone-200">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="text-stone-700">
                  {isOnline ? 'Gateway Connected (Online)' : 'Offline Mode (Local IndexedDB)'}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white border border-stone-200 text-stone-600">
                {isOnline ? 'FHIR R4 Ready' : 'Cached Locally'}
              </span>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2 my-3 text-center">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500 font-semibold mb-0.5">
                  <Database className="w-3 h-3 text-[#52833C]" />
                  Pending Sync
                </div>
                <div className="text-lg font-black text-stone-900">
                  {pendingCount}{' '}
                  <span className="text-[11px] font-normal text-stone-500">records</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500 font-semibold mb-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Synced to ABDM
                </div>
                <div className="text-lg font-black text-stone-900">
                  {syncedCount}{' '}
                  <span className="text-[11px] font-normal text-stone-500">bundles</span>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-1.5 text-[11px] text-stone-600 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/60 font-mono mb-3">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Gateway:</span>
                <span className="font-semibold truncate max-w-[170px]" title={activeGateway}>
                  dev.abdm.gov.in (v0.5)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">HIP Facility ID:</span>
                <span className="font-semibold">IN-HIP-AIIMS-NDHM-0881</span>
              </div>
              {lastTxnId && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Last TxID:</span>
                  <span className="font-semibold text-emerald-700 truncate max-w-[170px]">
                    {lastTxnId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Last Synced:</span>
                <span className="font-semibold text-stone-800">
                  {lastSyncedAt
                    ? new Date(lastSyncedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Just now'}
                </span>
              </div>
            </div>

            {/* Feedback notification */}
            {feedback && (
              <div className="mb-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {lastError && !feedback && (
              <div className="mb-3 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{lastError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#52833C] hover:bg-[#436e2f] disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Pushing to ABDM...' : 'Sync Now with Cloud'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AbdmSyncStatusBadge;
