import { maskKey, maskKeysInText } from '../utils/maskHelper';

export default function SharedAuditLog({ logs }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-1">System-Wide Audit Log</h2>
      <p className="text-xs text-slate-500 mb-4">
        Live record of Citizen form submissions and BLO house verifications (keys masked as XXxxxxXX).
      </p>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-500">No audit logs recorded yet.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {logs.map((log) => (
            <div
              key={log._id}
              className="border-l-4 border-blue-800 bg-slate-50 p-3 rounded text-sm"
            >
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-800">
                  [{log.actorRole}] {log.actorName}{' '}
                  {log.staffKey && log.staffKey !== 'N/A'
                    ? `(Key: ${maskKey(log.staffKey)})`
                    : ''}
                </span>
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-semibold text-blue-900 text-xs">{log.action}</p>
              <p className="text-xs text-slate-700 mt-0.5">
                {maskKeysInText(log.details)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
