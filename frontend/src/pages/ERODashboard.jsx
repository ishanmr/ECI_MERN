import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ApplicationCard from '../components/ApplicationCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function formatDate(value) { return new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function AuditRows({ logs, empty = 'No audit events have been recorded.' }) {
  return !logs.length ? <div className="audit-empty">{empty}</div> : <div className="audit-log-list">{logs.map(log => <article className="audit-log-row" key={log._id}>
    <span className={`audit-role role-${String(log.role || '').toLowerCase()}`}>{log.role}</span>
    <div className="audit-log-copy"><strong>{log.action.replaceAll('_', ' ')}</strong><span>{log.performedBy?.name || 'Staff account'}{log.applicationId?.formType ? ` · ${log.applicationId.formType.replaceAll('_', ' ')}` : ''}</span>{log.details && <p>{log.details}</p>}</div>
    <time>{formatDate(log.createdAt)}</time>
  </article>)}</div>;
}

export default function ERODashboard() {
  const [items, setItems] = useState([]); const [applications, setApplications] = useState([]); const [logs, setLogs] = useState([]);
  const [overview, setOverview] = useState({ totalApps: 0, pending: 0, verified: 0, approved: 0, keyCount: 0 }); const [inviteKeys, setInviteKeys] = useState([]);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null); const [searchKey, setSearchKey] = useState(''); const [bloWork, setBloWork] = useState(null);
  const refresh = useCallback(async () => {
    try {
      const [queue, audit, stats, keys, allApps] = await Promise.all([api('/applications/review'), api('/ero/audit-logs?limit=100'), api('/ero/overview'), api('/ero/invite-keys'), api('/ero/applications')]);
      setItems(queue); setApplications(allApps); setLogs(audit); setOverview(stats); setInviteKeys(keys); setError('');
    } catch (err) { setError(err.message); }
  }, []);
  useEffect(() => { refresh(); const timer = setInterval(refresh, 30000); return () => clearInterval(timer); }, [refresh]);
  async function decide(id, decision) {
    setBusy(true); setError(''); setNotice('');
    try { await api(`/applications/${id}/review`, { method: 'PATCH', body: JSON.stringify({ decision, remarks: decision === 'ERO_APPROVED' ? 'Approved by ERO' : 'Rejected by ERO' }) }); setNotice(decision === 'ERO_APPROVED' ? 'Application approved.' : 'Application rejected.'); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function createKey() {
    setBusy(true); setError(''); setNotice(''); setGeneratedKey(null);
    try { setGeneratedKey(await api('/ero/invite-keys', { method: 'POST', body: JSON.stringify({}) })); setNotice('BLO key created. Use it once for registration before it expires; the officer will need it each time they sign in.'); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function checkBlo(event) {
    event.preventDefault(); setBusy(true); setError(''); setBloWork(null);
    try { setBloWork(await api(`/ero/blo-work/${encodeURIComponent(searchKey.trim())}`)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function copyKey() {
    try { await navigator.clipboard.writeText(generatedKey.key); setNotice('Invitation key copied. It can register one officer; that officer must keep it for sign-in.'); }
    catch { setNotice('Select and copy the invitation key shown below.'); }
  }
  return <><div className="page-heading"><div><div className="eyebrow">ELECTORAL REGISTRATION OFFICER</div><h1>Officer workspace</h1><p>Manage booth invitations, review field activity, and make final application decisions.</p></div><span className="metric-chip"><strong>{overview.pending}</strong> pending BLO</span></div>
    {error && <div role="alert" className="form-message error">{error}</div>}{notice && <div role="status" className="form-message success">{notice}</div>}
    <section className="ero-stats-grid"><article className="stat-card"><span>Total forms</span><strong>{overview.totalApps}</strong><small>SSR and SIR applications</small></article><article className="stat-card"><span>Pending BLO</span><strong>{overview.pending}</strong><small>Awaiting field verification</small></article><article className="stat-card"><span>Awaiting ERO</span><strong>{overview.verified}</strong><small>Verified by a BLO</small></article><article className="stat-card"><span>Approved</span><strong>{overview.approved}</strong><small>Final decisions recorded</small></article><article className="stat-card"><span>BLO invitation keys</span><strong>{overview.keyCount}</strong><small>Issued to date</small></article></section>
    <div className="ero-tools-grid"><section className="panel staff-key-card"><div className="section-kicker">STAFF MANAGEMENT</div><h2>Invite a Booth Level Officer</h2><p>Create a one-time BLO registration key. It expires after seven days.</p><button className="button primary" disabled={busy} onClick={createKey}>{busy ? 'Working…' : 'Generate BLO key'} <span>+</span></button>
      {generatedKey && <div className="generated-key"><div><span>ONE-TIME INVITATION KEY</span><strong>{generatedKey.key}</strong><small>Expires {new Date(generatedKey.expiresAt).toLocaleString()}</small></div><button className="button secondary compact" onClick={copyKey}>Copy</button></div>}
      <div className="invite-key-list"><div className="mini-list-title"><strong>Issued BLO keys</strong><span>{inviteKeys.length}</span></div>{inviteKeys.length ? inviteKeys.slice(0, 6).map(key => <div className="invite-key-row" key={key._id}><span className={`key-state ${key.isUsed ? 'used' : new Date(key.expiresAt) < new Date() ? 'expired' : 'available'}`}>{key.isUsed ? 'Used' : new Date(key.expiresAt) < new Date() ? 'Expired' : 'Unused'}</span><span className="key-recipient">{key.usedBy ? `${key.usedBy.name}${key.usedBy.assignedBooth ? ` · ${key.usedBy.assignedBooth}` : ''}` : 'Awaiting registration'}</span><time>{new Date(key.createdAt).toLocaleDateString()}</time></div>) : <div className="audit-empty">No BLO invitations issued yet.</div>}</div>
    </section><section className="panel blo-audit-card"><div className="section-kicker">BOOTH ACTIVITY</div><h2>Review work by invitation</h2><p>Enter the key used by a registered BLO to view that officer’s audit trail.</p><form className="audit-search" onSubmit={checkBlo}><input value={searchKey} onChange={e => setSearchKey(e.target.value)} required inputMode="numeric" pattern="[0-9]{16}" maxLength="16" placeholder="16-digit BLO invitation key" /><button className="button secondary compact" disabled={busy}>Search</button></form>
      {bloWork && <div className="blo-work-result"><div className="blo-work-head"><span className="user-avatar">{bloWork.blo.name.slice(0, 1).toUpperCase()}</span><div><strong>{bloWork.blo.name}</strong><small>{bloWork.blo.role} · {bloWork.blo.assignedBooth || 'No booth assigned'}</small></div><span className="count-pill">{bloWork.logs.length}</span></div><AuditRows logs={bloWork.logs} empty="No recorded activity for this officer yet." /></div>}
    </section></div>
    <section className="panel audit-panel"><div className="panel-heading"><div><div className="section-kicker">SYSTEM ACTIVITY</div><h2>Audit log <span className="count-pill">{logs.length}</span></h2></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div><AuditRows logs={logs} /></section>
    <section className="panel applications-panel ero-review-panel"><div className="panel-heading"><div><div className="section-kicker">SYSTEM OVERVIEW</div><h2>All applications <span className="count-pill">{applications.length}</span></h2></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div>{!applications.length ? <div className="audit-empty">No applications have been submitted yet.</div> : <div className="application-list">{applications.map(app => <article className="ero-application-row" key={app._id}><div><strong>{app.formData?.firstName} {app.formData?.lastName}</strong><span>{app.formType.replaceAll('_', ' ')} · {app.campaignId?.title || app.campaignType}</span><small>{app.formData?.address}</small></div><StatusBadge status={app.status} /></article>)}</div>}</section>
    <section className="panel applications-panel ero-review-panel"><div className="panel-heading"><div><div className="section-kicker">FINAL DECISIONS</div><h2>Applications ready for review</h2></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div>
      {!items.length ? <div className="empty-state"><span className="empty-icon">✓</span><strong>No applications to review</strong><span>BLO-verified forms and new SIR enumerations will arrive here.</span></div> : <div className="application-list">{items.map(app => <ApplicationCard key={app._id} application={app} actions={<><button className="button secondary compact" disabled={busy} onClick={() => decide(app._id, 'REJECTED')}>Reject</button><button className="button approve compact" disabled={busy} onClick={() => decide(app._id, 'ERO_APPROVED')}>Approve <span>✓</span></button></>} />)}</div>}
    </section>
  </>;
}
