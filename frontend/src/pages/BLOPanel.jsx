import { useState, useEffect } from 'react';
import api from '../services/api';
import { maskKey } from '../utils/maskHelper';
import SharedAuditLog from '../components/SharedAuditLog';

export default function BLOPanel({ user }) {
  const [applications, setApplications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [checkedDocs, setCheckedDocs] = useState({});

  const loadData = async () => {
    try {
      const [appsRes, logsRes] = await Promise.all([
        api.get('/applications/all'),
        api.get('/audit-logs')
      ]);
      setApplications(appsRes.data);
      setAuditLogs(logsRes.data.filter((log) => log.actorRole !== 'ERO'));
    } catch (err) {
      console.error('Error loading BLO data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (appId) => {
    if (!checkedDocs[appId]) {
      alert('Please tick the verification checkbox confirming you visited the house and checked the documents.');
      return;
    }

    await api.put(`/applications/${appId}/approve`, {
      verificationNote: 'House visited and physical documents verified.'
    });

    loadData();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-1">Citizen Applications (BLO Field Verification)</h2>
        <p className="text-xs text-slate-500 mb-4">
          Visit the citizen house address, verify physical attachments, tick confirmation, and approve.
        </p>

        {applications.length === 0 ? (
          <p className="text-sm text-slate-500">No citizen applications submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="border p-4 rounded-lg bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded mr-2">
                      {app.formType}
                    </span>
                    <span className="font-bold text-base">{app.formData?.applicantName}</span>
                    <p className="text-xs text-slate-500">Submitted by Citizen: {app.citizenName}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      app.status === 'BLO_APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1 bg-white p-3 rounded border">
                  <p><strong>Address:</strong> {app.formData?.address}</p>
                  <p><strong>DOB / Applicant Info:</strong> {app.formData?.ageOrDob}</p>
                  <p><strong>Form Details:</strong> {app.formData?.reasonOrCorrection}</p>
                  <p><strong>Attachments to Verify:</strong> {app.formData?.documentProvided}</p>
                </div>

                {app.status === 'PENDING_BLO' ? (
                  <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={!!checkedDocs[app._id]}
                        onChange={(e) => setCheckedDocs({ ...checkedDocs, [app._id]: e.target.checked })}
                      />
                      I visited the house & manually verified the physical documents
                    </label>
                    <button
                      onClick={() => handleApprove(app._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Tick & Approve Application (Save with Key {maskKey(user.staffKey)})
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-emerald-700 font-semibold">
                    Verified by BLO {app.verifiedByBloName} (BLO Key: {maskKey(app.verifiedByBloKey)})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SharedAuditLog logs={auditLogs} />
    </div>
  );
}
