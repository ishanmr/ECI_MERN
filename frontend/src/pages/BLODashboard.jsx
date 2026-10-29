import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import ApplicationCard from '../components/ApplicationCard.jsx';

export default function BLODashboard() {
  const { user } = useAuth();
  const [mode, setMode] = useState('SSR'); const [pending, setPending] = useState([]); const [campaign, setCampaign] = useState(null);
  const [logs, setLogs] = useState([]); const [checkedDocs, setCheckedDocs] = useState({});
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const refresh = useCallback(async () => {
    try {
      const [items, active, audit] = await Promise.all([api('/applications/pending'), api('/campaigns/active', { auth: false }), api('/audit-logs?limit=50')]);
      setPending(items); setCampaign(active); setLogs(audit); setError('');
    } catch (err) { setError(err.message); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  async function verify(id) {
    if (!checkedDocs[id]) { setError('Confirm the house visit and document check before verifying this application.'); return; }
    setBusy(true); setError(''); setNotice('');
    try { await api(`/applications/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ visitConfirmed: true, remarks: 'BLO confirmed house visit and manually checked supporting documents.' }) }); setCheckedDocs(current => ({ ...current, [id]: false })); setNotice('Application verified and added to the ERO review queue.'); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function record(event) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setError(''); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { await api('/applications/sir', { method: 'POST', body: JSON.stringify({ booth: values.booth, formData: { firstName: values.firstName, lastName: values.lastName, dob: values.dob, address: values.address, epicNumber: values.epicNumber } }) }); form.reset(); setNotice('Enumeration recorded and sent to the ERO review queue.'); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <><div className="page-heading"><div><div className="eyebrow">BOOTH LEVEL OFFICER</div><h1>Field operations</h1><p>Verify SSR submissions or record new SIR enumerations.</p></div><span className="date-tag">{user.assignedBooth || 'Booth assignment pending'}</span></div>
    <div className="mode-switch" role="tablist"><button className={mode === 'SSR' ? 'chosen' : ''} onClick={() => setMode('SSR')} role="tab">SSR verification <span className="tab-count">{pending.length}</span></button><button className={mode === 'SIR' ? 'chosen sir-chosen' : ''} onClick={() => setMode('SIR')} role="tab">SIR enumeration</button></div>
    {error && <div role="alert" className="form-message error">{error}</div>}{notice && <div role="status" className="form-message success">{notice}</div>}
    {mode === 'SSR' ? <section className="panel applications-panel"><div className="panel-heading"><div><div className="section-kicker">CITIZEN SUBMISSIONS</div><h2>Waiting for your verification</h2></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div>
      {!pending.length ? <div className="empty-state"><span className="empty-icon">✓</span><strong>All caught up</strong><span>New SSR forms assigned to your booth will appear here.</span></div> : <div className="application-list">{pending.map(app => <ApplicationCard key={app._id} application={app} actions={<><label className="visit-confirm"><input type="checkbox" checked={!!checkedDocs[app._id]} onChange={event => setCheckedDocs(current => ({ ...current, [app._id]: event.target.checked }))} /><span>I visited the house and checked the documents</span></label><button className="button primary compact" disabled={busy || !checkedDocs[app._id]} onClick={() => verify(app._id)}>Verify details <span>✓</span></button></>} />)}</div>}
    </section> : <section className="panel form-panel sir-form-panel"><div className="sir-banner"><span className="feature-icon amber">⌂</span><div><div className="section-kicker">SPECIAL INTENSIVE REVISION</div><h2>Door-to-door enumeration</h2><p>Record elector details collected during your field visit. The ERO will review each record.</p></div></div>
      {campaign?.type !== 'SIR' && <div className="notice-line">There is no active SIR campaign at the moment. Enumeration submissions are disabled until an SIR campaign is opened.</div>}
      <form className="application-form" onSubmit={record}><div className="form-grid"><label>First name<input name="firstName" required maxLength="80" /></label><label>Last name <span className="optional">Optional</span><input name="lastName" maxLength="80" /></label><label>Date of birth <span className="optional">Optional</span><input name="dob" type="date" /></label><label>EPIC number <span className="optional">If available</span><input name="epicNumber" maxLength="30" /></label><label>Booth / part number <span className="optional">Defaults to your assignment</span><input name="booth" defaultValue={user.assignedBooth || ''} maxLength="80" /></label><label className="span-two">Verified residential address<textarea name="address" required maxLength="500" rows="3" /></label></div><div className="form-actions"><button className="button sir-button" disabled={busy || campaign?.type !== 'SIR'}>{busy ? 'Saving…' : 'Record enumeration'} <span>→</span></button></div></form>
    </section>}
    <section className="panel audit-panel"><div className="panel-heading"><div><div className="section-kicker">SHARED WITH ELECTION STAFF</div><h2>Recent system activity</h2></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div>{!logs.length ? <div className="audit-empty">No audit events have been recorded.</div> : <div className="audit-log-list">{logs.map(log => <article className="audit-log-row" key={log._id}><span className={`audit-role role-${String(log.role || '').toLowerCase()}`}>{log.role}</span><div className="audit-log-copy"><strong>{log.action.replaceAll('_', ' ')}</strong><span>{log.performedBy?.name || 'Portal user'}{log.applicationId?.formType ? ` · ${log.applicationId.formType.replaceAll('_', ' ')}` : ''}</span><p>{log.details}</p></div><time>{new Date(log.createdAt).toLocaleString()}</time></article>)}</div>}</section>
  </>;
}
