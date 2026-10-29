import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ApplicationCard from '../components/ApplicationCard.jsx';

function StatusPage({ campaign, applications, refresh }) {
  return <>
    <div className="page-heading"><div><div className="eyebrow">CITIZEN SERVICES</div><h1>Voter services overview</h1><p>Submit and follow applications related to your electoral record.</p></div><span className="date-tag">Updated just now</span></div>
    <div className="feature-grid"><article className="feature-card main-feature"><div className="feature-icon green">◎</div><div className="section-kicker">ACTIVE REVISION</div><h2>{campaign ? campaign.title : 'No active revision campaign'}</h2><p>{campaign ? campaign.type === 'SSR' ? 'Submit an eligible application for inclusion, deletion, or correction in the electoral roll.' : 'Your local BLO is conducting an intensive house-to-house enumeration.' : 'Check back later for the next voter revision cycle.'}</p>{campaign?.type === 'SSR' && <a className="button primary" href="/citizen/apply">Start an SSR application <span>→</span></a>}{campaign?.type === 'SIR' && <div className="notice-line">SIR enumeration is recorded by your assigned Booth Level Officer.</div>}</article>
      <article className="feature-card guidance-card"><div className="feature-icon amber">✦</div><div className="section-kicker">BEFORE YOU APPLY</div><h2>Keep your details ready</h2><ul><li>Use the name shown on your supporting documents.</li><li>Provide your current residential address.</li><li>Track status here after submitting.</li></ul></article></div>
    <section className="panel applications-panel"><div className="panel-heading"><div><div className="section-kicker">YOUR RECORD</div><h2>My applications <span className="count-pill">{applications.length}</span></h2></div><button className="text-button" onClick={refresh}>Refresh <span>↻</span></button></div>
      {applications.length ? <div className="application-list">{applications.map(app => <ApplicationCard key={app._id} application={app} />)}</div> : <div className="empty-state"><span className="empty-icon">▤</span><strong>No applications yet</strong><span>Your submitted forms and their review progress will appear here.</span></div>}
    </section>
  </>;
}

function ApplicationForm({ campaign, refresh }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [formType, setFormType] = useState('FORM_6');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const formData = { firstName: values.firstName, lastName: values.lastName, dob: values.dob, address: values.address, epicNumber: values.epicNumber, objectionReason: values.objectionReason, correctionDetails: values.correctionDetails, documentProvided: values.documentProvided };
    try { await api('/applications/ssr', { method: 'POST', body: JSON.stringify({ formType, formData, booth: values.booth }) }); await refresh(); navigate('/citizen'); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <><div className="page-heading"><div><div className="eyebrow">SPECIAL SUMMARY REVISION</div><h1>Submit an application</h1><p>Complete the details below. You can follow review progress from your overview.</p></div></div>
    {!campaign || campaign.type !== 'SSR' ? <div className="panel empty-state large"><span className="empty-icon">◷</span><strong>SSR applications are not open</strong><span>This form is available when an SSR campaign is active.</span><button className="button secondary" onClick={() => navigate('/citizen')}>Back to overview</button></div> : <section className="panel form-panel"><div className="form-context"><span>ACTIVE CAMPAIGN</span><strong>{campaign.title}</strong></div>{message && <div role="alert" className="form-message error">{message}</div>}
      <form className="application-form" onSubmit={submit}><label>Application type<select value={formType} onChange={e => setFormType(e.target.value)}><option value="FORM_6">Form 6 · New voter registration</option><option value="FORM_7">Form 7 · Objection or deletion request</option><option value="FORM_8">Form 8 · Correction or address update</option></select></label>
        <div className="form-grid"><label>First name<input name="firstName" required maxLength="80" placeholder="As shown on your documents" /></label><label>Last name <span className="optional">Optional</span><input name="lastName" maxLength="80" /></label><label>Date of birth <span className="optional">Optional</span><input name="dob" type="date" /></label><label>EPIC number <span className="optional">If available</span><input name="epicNumber" maxLength="30" placeholder="Voter ID number" /></label><label className="span-two">Polling booth / part number <span className="optional">If known</span><input name="booth" maxLength="80" placeholder="Optional; helps route your application" /></label>
          <label className="span-two">Residential address<textarea name="address" required maxLength="500" rows="3" placeholder="House, street, locality, district, state and PIN code" /></label>
          {formType === 'FORM_7' && <label className="span-two">Reason for objection<textarea name="objectionReason" required maxLength="500" rows="3" placeholder="Explain the reason for this request" /></label>}
          {formType === 'FORM_8' && <label className="span-two">Details to correct<textarea name="correctionDetails" required maxLength="500" rows="3" placeholder="Describe the entry that needs correction" /></label>}
          <label className="span-two">Supporting document <span className="optional">Optional</span><input name="documentProvided" maxLength="160" placeholder="e.g. proof of age or address" /></label>
        </div><div className="form-actions"><button type="button" className="button secondary" onClick={() => navigate('/citizen')}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit application'} <span>→</span></button></div>
      </form></section>}
  </>;
}

export default function CitizenDashboard() {
  const [campaign, setCampaign] = useState(null); const [applications, setApplications] = useState([]); const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { const [active, mine] = await Promise.all([api('/campaigns/active', { auth: false }), api('/applications/mine')]); setCampaign(active); setApplications(mine); setError(''); }
    catch (err) { setError(err.message); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <><div className="citizen-subnav"><a href="/citizen" className={location.pathname === '/citizen' ? 'selected' : ''}>Overview</a><a href="/citizen/apply" className={location.pathname.includes('/apply') ? 'selected' : ''}>Apply for SSR</a></div>{error && <div role="alert" className="form-message error">{error}</div>}
    <Routes><Route index element={<StatusPage campaign={campaign} applications={applications} refresh={refresh} />} /><Route path="apply" element={<ApplicationForm campaign={campaign} refresh={refresh} />} /></Routes></>;
}
