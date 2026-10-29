const labels = { PENDING: 'Awaiting BLO', BLO_VERIFIED: 'Awaiting ERO', ERO_APPROVED: 'Approved', REJECTED: 'Rejected' };
export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${String(status || '').toLowerCase()}`}>{labels[status] || status}</span>;
}
