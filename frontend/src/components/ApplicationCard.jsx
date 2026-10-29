import StatusBadge from './StatusBadge.jsx';

const formNames = { FORM_6: 'Form 6 · New registration', FORM_7: 'Form 7 · Objection', FORM_8: 'Form 8 · Correction', SIR_ENUMERATION: 'SIR · Field enumeration' };
export default function ApplicationCard({ application, actions }) {
  const { formData = {} } = application;
  return <article className="application-card">
    <div className="application-main">
      <div className="application-avatar">{formData.firstName?.slice(0, 1)?.toUpperCase() || 'V'}</div>
      <div className="application-details">
        <div className="application-title"><strong>{formData.firstName} {formData.lastName}</strong><StatusBadge status={application.status} /></div>
        <span>{formNames[application.formType] || application.formType} <i>·</i> {application.booth || 'Booth not assigned'}</span>
        <p>{formData.address}</p>
        {formData.objectionReason && <p className="reason"><b>Objection:</b> {formData.objectionReason}</p>}
        {formData.correctionDetails && <p className="reason"><b>Correction:</b> {formData.correctionDetails}</p>}
        {formData.documentProvided && <p className="reason"><b>Supporting document:</b> {formData.documentProvided}</p>}
        <small>Submitted {new Date(application.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</small>
      </div>
    </div>
    {actions && <div className="application-actions">{actions}</div>}
  </article>;
}
