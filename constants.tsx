
import React from 'react';
import { TaskStatus } from './types';

export const INITIAL_DATA = {
  tasks: [
    {
      "id": "t-binders-redacted",
      "name": "Redacted Subgrantee Binders",
      "description": "Process and verify redacted versions of subgrantee binders for public release.",
      "dependentTasks": ["t30"],
      "notes": [],
      "program": "BEAD",
      "assignedTo": "Dayna",
      "assignedToId": "u-dayna",
      "priority": "High",
      "startDate": "2025-12-29",
      "plannedEndDate": "2026-01-09",
      "actualEndDate": "",
      "status": TaskStatus.OPEN,
      "progress": 0,
      "updatedAt": "2025-12-29T09:14:40.014Z",
      "updatedBy": "System Admin"
    },
    {
      "id": "t-usda-allotment",
      "name": "USDA Advice Allotment Initial",
      "description": "Initial filing for USDA funding advice allotment.",
      "dependentTasks": [],
      "notes": [],
      "program": "USDA",
      "assignedTo": "Melia",
      "assignedToId": "u-melia",
      "priority": "High",
      "startDate": "2025-12-01",
      "plannedEndDate": "2025-12-15",
      "actualEndDate": "2025-12-15",
      "status": TaskStatus.COMPLETED,
      "progress": 100,
      "updatedAt": "2025-12-29T08:42:30.667Z",
      "updatedBy": "system"
    },
    {
      "id": "t-ptc-travel",
      "name": "Travel for PTC",
      "description": "Logistics and travel arrangements for the PTC conference.",
      "dependentTasks": [],
      "notes": [],
      "program": "BPD",
      "assignedTo": "Dolorez",
      "assignedToId": "u-dolorez",
      "priority": "High",
      "startDate": "2025-12-26",
      "plannedEndDate": "2026-01-09",
      "actualEndDate": "",
      "status": TaskStatus.IN_PROGRESS,
      "progress": 45,
      "updatedAt": "2025-12-29T09:15:40.079Z",
      "updatedBy": "System Admin"
    }
  ],
  programs: [
    { id: "p-bead", name: "BEAD", description: "Broadband Equity, Access, and Deployment", color: "indigo", createdAt: "2024-01-01T00:00:00Z", createdBy: "u-admin" },
    { id: "p-cpf", name: "CPF", description: "Capital Projects Fund", color: "emerald", createdAt: "2024-01-01T00:00:00Z", createdBy: "u-admin" },
    { id: "p-usda", name: "USDA", description: "USDA Broadband Technical Assistance", color: "amber", createdAt: "2024-01-01T00:00:00Z", createdBy: "u-admin" },
    { id: "p-bpd", name: "BPD", description: "Broadband Policy and Development", color: "rose", createdAt: "2024-01-01T00:00:00Z", createdBy: "u-admin" }
  ],
  users: [
    { id: "u-admin", name: "System Admin", email: "admin@bpd.gov", role: "Admin", department: "Operations" },
    { id: "u-glen", name: "Glen", email: "g.hunter@cnmi.gov", role: "Manager", department: "BEAD" },
    { id: "u-melia", name: "Melia", email: "me.johnson@dof.gov.mp", role: "Staff", department: "BEAD" },
    { id: "u-dolorez", name: "Dolorez", email: "d.salas@bpd.cnmi.gov", role: "Admin", department: "BEAD" }
  ]
};

export const PROGRAM_COLORS: Record<string, string> = {
  BEAD: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  CPF: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  USDA: 'bg-amber-100 text-amber-700 border-amber-200',
  BPD: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const getProgramColor = (programName: string): string => {
  return PROGRAM_COLORS[programName] || 'bg-slate-100 text-slate-700 border-slate-200';
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.OPEN]: 'bg-slate-100 text-slate-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [TaskStatus.ON_HOLD]: 'bg-orange-100 text-orange-700',
};
