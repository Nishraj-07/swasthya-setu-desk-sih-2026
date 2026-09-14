/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PatientQueueItem, HospitalDepartment } from '../types';
import { ChevronRight, AlertTriangle, Users } from 'lucide-react';

interface DepartmentCardProps {
  department: HospitalDepartment;
  queue: PatientQueueItem[];
  onSelectDepartment: (deptName: string) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  queue,
  onSelectDepartment,
}) => {
  // Dynamically derive statistics from the master queue (Single Source of Truth)
  const deptQueue = queue.filter(
    (item) => item.department.toLowerCase() === department.name.toLowerCase() ||
              item.department.toLowerCase().includes(department.name.split(' ')[0].toLowerCase())
  );

  const waitingCount = deptQueue.filter(
    (item) => item.status === 'WAITING' || item.status === 'EMERGENCY_TRIAGE'
  ).length;

  const emergencyCount = deptQueue.filter(
    (item) => item.redFlagSeverity === 'CRITICAL' || item.status === 'EMERGENCY_TRIAGE' || item.socrates.severity >= 8
  ).length;

  const consultedCount = deptQueue.filter(
    (item) => item.status === 'COMPLETED'
  ).length;

  return (
    <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-md space-y-4 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] bg-slate-900 text-cyan-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-700">
            {department.code} • {department.roomNumber}
          </span>
          <h3 className="text-base font-bold text-white mt-1.5">{department.name}</h3>
          <p className="text-xs text-slate-400">{department.currentDoctor}</p>
        </div>
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
            waitingCount > 0
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {waitingCount > 0 ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/80 text-center">
        <div className="bg-slate-900/80 p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Queue</div>
          <div className="text-base font-black text-white">{waitingCount > 0 ? waitingCount : 0}</div>
        </div>
        <div className="bg-slate-900/80 p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Emergency</div>
          <div className="text-base font-black text-red-400">{emergencyCount > 0 ? emergencyCount : 0}</div>
        </div>
        <div className="bg-slate-900/80 p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Consulted</div>
          <div className="text-base font-black text-cyan-400">{consultedCount > 0 ? consultedCount : 0}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-400">
          Dynamic Sync Active
        </span>
        <button
          type="button"
          onClick={() => onSelectDepartment(department.name)}
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
        >
          <span>View Queue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
