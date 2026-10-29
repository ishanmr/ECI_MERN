import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loginRole, setLoginRole] = useState('CITIZEN');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';
  const isStaff = mode === 'staff';
  async function submit(event) {
    event.preventDefault(); setMessage(''); setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!isRegister && !isStaff) values.role = loginRole;
    try {
      const session = isRegister || isStaff ? await register(values, isStaff) : await login(values);
      const destinations = { CITIZEN: '/citizen', BLO: '/blo', ERO: '/ero', ADMIN: '/admin' };
      navigate(destinations[session.user.role] || '/');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <div className="auth-layout"><section className="auth-story"><div className="brand"><span className="brand-mark">EC</span><span><strong>Election Portal</strong><small>VOTER SERVICES</small></span></div><div className="story-content"><span className="story-eyebrow"><i /> ELECTORAL SERVICES, MADE SIMPLE</span><h1>Your voice.<br /><em>Your vote.</em></h1><p>Apply for voter services, track your application, and support accurate electoral rolls through a secure digital portal.</p><div className="trust-card"><span>✓</span><div><strong>Secure by design</strong><small>Your account and application details are protected.</small></div></div></div><div className="story-foot">Election Commission of India · Voter services portal</div></section>
    <section className="auth-panel"><div className="auth-card"><span className="eyebrow">{isStaff ? 'STAFF ACCESS' : isRegister ? 'GET STARTED' : 'WELCOME BACK'}</span><h2>{isStaff ? 'Create a staff account' : isRegister ? 'Create your account' : 'Sign in to continue'}</h2><p className="auth-lede">{isStaff ? 'Use the one-time 16-digit invitation key provided by your administrator or ERO.' : isRegister ? 'Register to submit and follow your voter applications.' : 'Access your election services workspace.'}</p>
      {message && <div className="form-message error" role="alert">{message}</div>}
      <form className="auth-form" onSubmit={submit}>
        {(isRegister || isStaff) && <label>Full name<input name="name" autoComplete="name" required maxLength="80" placeholder="Your name" /></label>}
        {!isRegister && !isStaff && <label>Account type<select name="role" value={loginRole} onChange={e => setLoginRole(e.target.value)}><option value="CITIZEN">Citizen</option><option value="BLO">Booth Level Officer (BLO)</option><option value="ERO">Electoral Registration Officer (ERO)</option><option value="ADMIN">Administrator</option></select></label>}
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label>Password<input name="password" type="password" autoComplete={isRegister || isStaff ? 'new-password' : 'current-password'} minLength="8" required placeholder={isRegister || isStaff ? 'At least 8 characters' : 'Your password'} /></label>
        {!isRegister && !isStaff && ['BLO', 'ERO'].includes(loginRole) && <label>Staff key<input name="staffKey" type="password" inputMode="numeric" pattern="[0-9]{16}" maxLength="16" required autoComplete="off" placeholder="Your 16-digit registration key" /></label>}
        {isStaff && <><label>Invitation key<input name="inviteKey" type="text" inputMode="numeric" pattern="[0-9]{16}" maxLength="16" required autoComplete="off" placeholder="Enter your one-time 16-digit key" /></label><label>Assigned booth <span className="optional">BLO only · Optional</span><input name="assignedBooth" placeholder="e.g. Booth 24" /></label></>}
        <button className="button primary full-width" disabled={busy}>{busy ? 'Please wait…' : isStaff ? 'Create staff account' : isRegister ? 'Create account' : 'Sign in'} <span>→</span></button>
      </form>
      <div className="auth-switch">{isStaff ? <>Need citizen access? <Link to="/register">Create a citizen account</Link></> : isRegister ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New to the portal? <Link to="/register">Create an account</Link></>}</div>
      {!isStaff && <div className="staff-link"><Link to="/staff">Register as election staff <span>→</span></Link></div>}
      <div className="auth-footnote">For assistance with voter registration, contact your local Electoral Registration Office.</div>
    </div></section></div>;
}
