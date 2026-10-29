import { useState, useEffect } from 'react';
import api from '../services/api';
import { maskKey } from '../utils/maskHelper';
import SharedAuditLog from '../components/SharedAuditLog';
import StatCard from '../components/StatCard';

export default function EROPanel() {
  const [applications, setApplications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [bloKeys, setBloKeys] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [inspectedBlo, setInspectedBlo] = useState(null);

  const loadAll = async () => {
    try {
      const [appsRes, logsRes, keysRes] = await Promise.all([
        api.get('/applications/all'),
        api.get('/audit-logs'),
        api.get('/ero/keys')
      ]);
      setApplications(appsRes.data);
      setAuditLogs(logsRes.data);
      setBloKeys(keysRes.data);
    } catch (err) {
      console.error('Error loading ERO dashboard:', err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleGenerateBloKey = async () => {
    const res = await api.post('/ero/generate-blo-key');
    alert(`New 16-Character Alphanumeric BLO Key Generated: ${res.data.key}`);
    loadAll();
  };

  const handleInspectKey = async (keyToCheck) => {
    const target = (keyToCheck || searchKey).trim().toUpperCase();
    if (!target) return;
    setSearchKey(target);
    const res = await api.get(`/ero/blo-work/${target}`);
    setInspectedBlo(res.data);
  };

  const pendingCount = applications.filter((a) => a.status === 'PENDING_BLO').length;
  const approvedCount = applications.filter((a) => a.status === 'BLO_APPROVED').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Citizen Forms" value={applications.length} borderColor="border-blue-600" />
        <StatCard title="Pending House Visit" value={pendingCount} borderColor="border-amber-500" />
        <StatCard title="Approved by BLOs" value={approvedCount} borderColor="border-emerald-600" />
        <StatCard title="Generated BLO Keys" value={bloKeys.length} borderColor="border-purple-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold">1. Generate 16-Char Alphanumeric BLO Keys</h2>
              <p className="text-xs text-slate-500">
                BLOs use these keys in the Combined Staff Portal to register and log in.
              </p>
            </div>
            <button
              onClick={handleGenerateBloKey}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded text-sm shadow"
            >
              + Generate New BLO Key
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bloKeys.map((k) => (
              <div key={k._id} className="border p-3 rounded flex justify-between items-center bg-slate-50">
                <div>
                  <p className="font-mono font-bold text-sm tracking-wider text-purple-900">{k.key}</p>
                  <p className="text-xs text-slate-600">
                    {k.isUsed
                      ? `Registered to BLO: ${k.assignedToName} (${k.assignedToEmail})`
                      : 'Unused — Ready for new BLO'}
                  </p>
                </div>
                <button
                  onClick={() => handleInspectKey(k.key)}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold px-3 py-1.5 rounded"
                >
                  Check This BLO Work
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-1">2. Check Specific BLO Work by Key</h2>
          <p className="text-xs text-slate-500 mb-4">
            Insert any 16-character BLO key to inspect only that BLO officer's verified forms.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Paste 16-char Alphanumeric BLO Key..."
              className="border p-2 rounded w-full font-mono uppercase text-sm"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
            />
            <button
              onClick={() => handleInspectKey(searchKey)}
              className="bg-blue-900 text-white font-bold px-4 py-2 rounded text-sm"
            >
              Check Work
            </button>
          </div>

          {inspectedBlo && (
            <div className="bg-slate-50 border p-4 rounded space-y-3">
              <div className="border-b pb-2">
                <p className="font-bold text-sm">
                  BLO Name: <span className="text-blue-900">{inspectedBlo.bloName}</span> ({inspectedBlo.bloEmail})
                </p>
                <p className="text-xs font-mono text-slate-600">BLO Key: {inspectedBlo.key}</p>
                <p className="text-xs font-bold text-emerald-700 mt-1">
                  Total House Visits Approved: {inspectedBlo.approvedApplications.length}
                </p>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto">
                {inspectedBlo.approvedApplications.length === 0 ? (
                  <p className="text-xs text-slate-500">No applications approved under this BLO key yet.</p>
                ) : (
                  inspectedBlo.approvedApplications.map((app) => (
                    <div key={app._id} className="bg-white p-2.5 rounded border text-xs">
                      <p className="font-bold">{app.formType} — {app.formData?.applicantName}</p>
                      <p className="text-slate-600">Address: {app.formData?.address}</p>
                      <p className="text-slate-600">Docs: {app.formData?.documentProvided}</p>
                      <p className="text-emerald-700 font-semibold">
                        Approved on {new Date(app.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All System Applications Overview</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applications.map((app) => (
              <div key={app._id} className="border p-3 rounded text-sm flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-900">{app.formType}</span> —{' '}
                  <strong>{app.formData?.applicantName}</strong>
                  <p className="text-xs text-slate-500">Address: {app.formData?.address}</p>
                  <p className="text-xs text-slate-600">{app.formData?.reasonOrCorrection}</p>
                  {app.verifiedByBloKey && (
                    <p className="text-xs text-emerald-700 font-mono">
                      Verified by {app.verifiedByBloName} (Key: {maskKey(app.verifiedByBloKey)})
                    </p>
                  )}
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
            ))}
          </div>
        </div>

        <SharedAuditLog logs={auditLogs} />
      </div>
    </div>
  );
}
