import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState([]); const [active, setActive] = useState(null); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState({ users: 0, totalApps: 0, pending: 0, verified: 0, approved: 0 });
  const [inviteRole, setInviteRole] = useState('BLO'); const [invite, setInvite] = useState(null);
  const refresh = useCallback(async () => { try { const [all, current, totals] = await Promise.all([api('/campaigns'), api('/campaigns/active', { auth: false }), api('/admin/stats')]); setCampaigns(all); setActive(current); setStats(totals); setError(''); } catch (err) { setError(err.message); } }, []);
  useEffect(() => { refresh(); }, [refresh]);
  async function create(event) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setError(''); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try { await api('/campaigns', { method: 'POST', body: JSON.stringify(values) }); form.reset(); setNotice('Campaign created. Activate it when it is ready.'); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function activate(id) {
    setBusy(true); setError(''); setNotice('');
    try { await api(`/campaigns/${id}/activate`, { method: 'PATCH' }); setNotice('Campaign activated. It is now available to the appropriate portal users.'); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function generateKey() {
    setBusy(true); setError(''); setNotice(''); setInvite(null);
    try { const result = await api('/admin/invite-keys', { method: 'POST', body: JSON.stringify({ role: inviteRole }) }); setInvite(result); setNotice(`${inviteRole} key generated. Use it once for registration before it expires; the officer will need it each time they sign in.`); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function copyKey() {
    try { await navigator.clipboard.writeText(invite.key); setNotice('Invitation key copied. It can register one officer; that officer must keep it for sign-in.'); }
    catch { setNotice('Select and copy the invitation key shown below.'); }
  }
  return <><div className="page-heading"><div><div className="eyebrow">PORTAL ADMINISTRATION</div><h1>Admin control panel</h1><p>Monitor the portal, invite election staff, and manage revision cycles.</p></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div>
    {error && <div role="alert" className="form-message error">{error}</div>}{notice && <div role="status" className="form-message success">{notice}</div>}
    <section className="admin-stats-grid"><article className="stat-card"><span>Total users</span><strong>{stats.users}</strong><small>Registered portal accounts</small></article><article className="stat-card"><span>Total applications</span><strong>{stats.totalApps}</strong><small>SSR and SIR records</small></article><article className="stat-card"><span>Pending BLO</span><strong>{stats.pending}</strong><small>Waiting for field verification</small></article><article className="stat-card"><span>Awaiting ERO</span><strong>{stats.verified}</strong><small>BLO-verified submissions</small></article><article className="stat-card"><span>Approved</span><strong>{stats.approved}</strong><small>Final decisions recorded</small></article></section>
    <div className="admin-grid"><section className="panel invite-admin-card"><div className="panel-heading inline-heading"><div><div className="section-kicker">STAFF MANAGEMENT</div><h2>Create an invitation key</h2></div></div><p>Generate a one-time key for a new BLO or ERO. Share it with that officer; the key expires after seven days.</p><div className="invite-admin-controls"><select value={inviteRole} onChange={e => setInviteRole(e.target.value)}><option value="BLO">Booth Level Officer (BLO)</option><option value="ERO">Electoral Registration Officer (ERO)</option></select><button className="button primary" onClick={generateKey} disabled={busy}>{busy ? 'Working…' : 'Generate key'} <span>+</span></button></div>{invite && <div className="generated-key"><div><span>ONE-TIME {invite.role} KEY</span><strong>{invite.key}</strong><small>Expires {new Date(invite.expiresAt).toLocaleString()}</small></div><button className="button secondary compact" onClick={copyKey}>Copy</button></div>}</section>
      <section className="panel form-panel"><div className="panel-heading inline-heading"><div><div className="section-kicker">NEW CYCLE</div><h2>Create a campaign</h2></div></div><form className="application-form" onSubmit={create}><label>Campaign title<input name="title" required maxLength="120" placeholder="e.g. Annual SSR 2026" /></label><label>Revision type<select name="type" required><option value="SSR">Special Summary Revision (SSR)</option><option value="SIR">Special Intensive Revision (SIR)</option></select></label><label>Qualifying date <span className="optional">Optional</span><input type="date" name="qualifyingDate" /></label><div className="form-actions"><button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Create campaign'} <span>→</span></button></div></form></section>
      <section className="panel campaign-panel"><div className="panel-heading inline-heading"><div><div className="section-kicker">REVISION CALENDAR</div><h2>Campaigns</h2></div><span className="count-pill">{campaigns.length}</span></div>
        {!campaigns.length ? <div className="empty-state"><span className="empty-icon">◈</span><strong>No campaigns yet</strong><span>Create a revision cycle to get started.</span></div> : <div className="campaign-list">{campaigns.map(c => <article className="campaign-row" key={c._id}><div className={`campaign-symbol ${c.type.toLowerCase()}`}>{c.type}</div><div className="campaign-info"><strong>{c.title}</strong><span>{c.type === 'SSR' ? 'Summary revision' : 'Intensive revision'}{c.qualifyingDate ? ` · Qualifying date ${new Date(c.qualifyingDate).toLocaleDateString()}` : ''}</span></div>{c.isActive ? <span className="live-pill"><i /> Active</span> : <button className="button secondary compact" disabled={busy} onClick={() => activate(c._id)}>Activate</button>}</article>)}</div>}
      </section></div>
      {active && <div className="active-campaign-note"><span>●</span><div><strong>Currently active: {active.title}</strong><small>{active.type} · Citizen and field workflows are enabled for this campaign.</small></div></div>}
    </>;
}
