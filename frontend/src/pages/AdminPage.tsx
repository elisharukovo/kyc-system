import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button, StatusBadge, Spinner } from '../components/ui';
import { getAllApplicants, getApiError } from '../services/api';
import type { Applicant } from '../types';

export function AdminPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllApplicants();
      setApplicants(res.data);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const stats = [
    { label: 'Total',    value: applicants.length,                                          icon: Users,        bg: 'bg-brand-50',  ic: 'text-brand-600' },
    { label: 'Approved', value: applicants.filter(a => a.status === 'VERIFIED').length,     icon: CheckCircle2, bg: 'bg-green-50',  ic: 'text-green-600' },
    { label: 'Rejected', value: applicants.filter(a => a.status === 'REJECTED').length,     icon: XCircle,      bg: 'bg-red-50',    ic: 'text-red-500'   },
    { label: 'Pending',  value: applicants.filter(a => ['PENDING','STEP1_VERIFIED'].includes(a.status)).length, icon: Clock, bg: 'bg-amber-50', ic: 'text-amber-500' },
  ];

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">All KYC applications overview</p>
        </div>
        <Button variant="secondary" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} className="card flex items-center gap-3 py-4">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${ic}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><Spinner size="lg" /></div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium">No applications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  {['Applicant', 'Loan Amount', 'Status', 'Submitted', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applicants.map((a) => (
                  <React.Fragment key={a.id}>
                    <tr
                      key={a.id}
                      onClick={() => toggle(a.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{a.firstName} {a.lastName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                        ${a.loanAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-5 py-3.5 text-gray-300">
                        {expanded === a.id
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                      </td>
                    </tr>

                    {expanded === a.id && (
                      <tr key={`${a.id}-detail`} className="bg-slate-50">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                            {[
                              ['National ID',  a.nationalId],
                              ['Phone',        a.phone],
                              ['Employment',   a.employmentStatus.replace('_', ' ')],
                              ['Income/mo',    `$${a.monthlyIncome.toLocaleString()}`],
                            ].map(([label, value]) => (
                              <div key={label} className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                                <p className="text-gray-400 mb-0.5">{label}</p>
                                <p className="font-semibold text-gray-700">{value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 text-xs mb-3">
                            <p className="text-gray-400 mb-0.5">Loan Purpose</p>
                            <p className="text-gray-700">{a.loanPurpose}</p>
                          </div>
                          {a.verificationSteps?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {a.verificationSteps.map(step => (
                                <div key={step.id} className={`rounded-lg px-3 py-1.5 text-xs border ${
                                  step.status === 'PASSED' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                  <span className="font-bold">Step {step.step} ({step.type})</span>: {step.status}
                                  {step.notes && <span className="ml-1 opacity-70">- {step.notes}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-300 font-mono mt-2 break-all">ID: {a.id}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
