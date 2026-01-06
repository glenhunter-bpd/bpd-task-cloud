
import React from 'react';
import { TaskStatus } from './types';

export const INITIAL_DATA = {
  tasks: [
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
      "startDate": "2025-01-05",
      "plannedEndDate": "2025-01-20",
      "actualEndDate": "2025-01-20",
      "status": TaskStatus.COMPLETED,
      "progress": 100,
      "updatedAt": "2025-12-29T08:42:30.667Z",
      "updatedBy": "system"
    },
    {
      "id": "t-ptc-travel",
      "name": "Travel for PTC",
      "description": "Logistics and travel arrangements for the PTC conference.",
      "dependentTasks": ["t-usda-allotment"],
      "notes": [],
      "program": "BPD",
      "assignedTo": "Dolorez",
      "assignedToId": "u-dolorez",
      "priority": "High",
      "startDate": "2025-01-25",
      "plannedEndDate": "2025-02-10",
      "actualEndDate": "",
      "status": TaskStatus.IN_PROGRESS,
      "progress": 45,
      "updatedAt": "2025-12-29T09:15:40.079Z",
      "updatedBy": "System Admin"
    },
    {
      "id": "t-binders-redacted",
      "name": "Redacted Subgrantee Binders",
      "description": "Process and verify redacted versions of subgrantee binders for public release.",
      "dependentTasks": ["t-ptc-travel"],
      "notes": [],
      "program": "BEAD",
      "assignedTo": "Dayna",
      "assignedToId": "u-dayna",
      "priority": "High",
      "startDate": "2025-02-15",
      "plannedEndDate": "2025-03-01",
      "actualEndDate": "",
      "status": TaskStatus.OPEN,
      "progress": 0,
      "updatedAt": "2025-12-29T09:14:40.014Z",
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
    { id: "u-dolorez", name: "Dolorez", email: "d.salas@bpd.cnmi.gov", role: "Admin", department: "BEAD" },
    { id: "u-dayna", name: "Dayna", email: "dayna@bpd.gov", role: "Staff", department: "BEAD" }
  ]
};

export const PROGRAM_COLORS: Record<string, string> = {
  BEAD: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  CPF: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  USDA: 'bg-amber-50 text-amber-700 border-amber-100',
  BPD: 'bg-rose-50 text-rose-700 border-rose-100',
};

export const getProgramColor = (programName: string): string => {
  return PROGRAM_COLORS[programName] || 'bg-slate-50 text-slate-700 border-slate-100';
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.OPEN]: 'bg-slate-900 text-white',
  [TaskStatus.IN_PROGRESS]: 'bg-indigo-500 text-white shadow-lg shadow-indigo-100',
  [TaskStatus.COMPLETED]: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100',
  [TaskStatus.ON_HOLD]: 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-100',
};
