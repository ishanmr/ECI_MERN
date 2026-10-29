import { useState } from 'react';
import api from '../services/api';

export default function AuthPortal({ onLoginSuccess }) {
  const [portalType, setPortalType] = useState('CITIZEN');
  const [mode, setMode] = useState('LOGIN');
  const [chosenForm, setChosenForm] = useState('FORM_6');
  const [form, setForm] = useState({ name: '', email: '', password: '', staffKey: '' });
  const [message, setMessage] = useState({ text: '', isError: false });

  const switchPortal = (type) => {
    setPortalType(type);
    setMessage({ text: '', isError: false });
    setForm({ name: '', email: '', password: '', staffKey: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', isError: false });

    try {
      if (mode === 'REGISTER') {
        const res = await api.post('/auth/register', { ...form, portalType });
        setMessage({ text: res.data.message, isError: false });
        setMode('LOGIN');
      } else {
        const res = await api.post('/auth/login', { ...form, portalType });
        localStorage.setItem('eci_token', res.data.token);
        localStorage.setItem('eci_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user, portalType === 'CITIZEN' ? chosenForm : null);
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || 'Authentication error occurred',
        isError: true
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6">
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          type="button"
          onClick={() => switchPortal('CITIZEN')}
          className={`py-3 rounded-t-lg font-bold border-b-4 transition ${
            portalType === 'CITIZEN'
              ? 'bg-white border-blue-600 text-blue-800 shadow'
              : 'bg-slate-200 border-transparent text-slate-600'
          }`}
        >
          1. Citizen Portal (Forms 6, 7, 8)
        </button>
        <button
          type="button"
          onClick={() => switchPortal('STAFF')}
          className={`py-3 rounded-t-lg font-bold border-b-4 transition ${
            portalType === 'STAFF'
              ? 'bg-white border-emerald-600 text-emerald-800 shadow'
              : 'bg-slate-200 border-transparent text-slate-600'
          }`}
        >
          2. Official Staff Portal (BLO & ERO)
        </button>
      </div>

      <div className="bg-white p-8 rounded-b-lg shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h2 className="text-2xl font-bold">
              {portalType === 'CITIZEN' ? 'Citizen' : 'Staff (BLO / ERO)'}{' '}
              {mode === 'LOGIN' ? 'Login' : 'Registration'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {portalType === 'CITIZEN'
                ? 'Select your statutory form below and log in to proceed.'
                : 'Combined login for BLO and ERO. Role is automatically detected from your 16-character alphanumeric key.'}
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded">
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                mode === 'LOGIN' ? 'bg-blue-800 text-white' : 'text-slate-600'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('REGISTER')}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                mode === 'REGISTER' ? 'bg-blue-800 text-white' : 'text-slate-600'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`p-3 rounded mb-4 text-sm font-medium ${
              message.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                className="w-full border p-2.5 rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full border p-2.5 rounded"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              className="w-full border p-2.5 rounded"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {portalType === 'CITIZEN' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-2">
              <label className="block text-xs font-bold text-blue-900 uppercase">
                Select Statutory Form to Open Upon Login
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChosenForm('FORM_6')}
                  className={`p-2 rounded text-xs font-bold border ${
                    chosenForm === 'FORM_6'
                      ? 'bg-blue-700 text-white border-blue-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Form 6 (New Voter)
                </button>
                <button
                  type="button"
                  onClick={() => setChosenForm('FORM_7')}
                  className={`p-2 rounded text-xs font-bold border ${
                    chosenForm === 'FORM_7'
                      ? 'bg-red-700 text-white border-red-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Form 7 (Deletion)
                </button>
                <button
                  type="button"
                  onClick={() => setChosenForm('FORM_8')}
                  className={`p-2 rounded text-xs font-bold border ${
                    chosenForm === 'FORM_8'
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Form 8 (Correction)
                </button>
              </div>
            </div>
          )}

          {portalType === 'STAFF' && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded">
              <label className="block text-sm font-bold text-amber-900 mb-1">
                16-Character Alphanumeric Staff Key (BLO Key or ERO .env Key)
              </label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="e.g., 9F4K8A2M7P1X6W3Q"
                className="w-full border p-2 rounded font-mono uppercase tracking-widest bg-white"
                value={form.staffKey}
                onChange={(e) => setForm({ ...form, staffKey: e.target.value.toUpperCase() })}
              />
            </div>
          )}

          <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded shadow">
            {mode === 'LOGIN'
              ? portalType === 'CITIZEN'
                ? `Login & Open ${chosenForm.replace('_', ' ')}`
                : 'Login to Staff Portal (BLO / ERO)'
              : portalType === 'CITIZEN'
              ? 'Register Citizen Account'
              : 'Register Staff Account (BLO / ERO)'}
          </button>
        </form>
      </div>
    </div>
  );
}
