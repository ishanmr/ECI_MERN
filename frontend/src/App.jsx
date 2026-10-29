<<<<<<< HEAD
import { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthPortal from './pages/AuthPortal';
import CitizenPanel from './pages/CitizenPanel';
import BLOPanel from './pages/BLOPanel';
import EROPanel from './pages/EROPanel';
=======
// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function maskKey(key) {
  if (!key || key === 'N/A') return '';
  const str = String(key).trim();
  if (str.length <= 4) return str;
  return `${str.slice(0, 2)}xxxx${str.slice(-2)}`;
}

function maskKeysInText(text) {
  if (!text) return '';
  return text.replace(/\b(\d{2})\d{4,}(\d{2})\b/g, '$1xxxx$2');
}
>>>>>>> 70108038339f07e1273cf82609242007d0340237

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eci_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCitizenForm, setSelectedCitizenForm] = useState(() => {
    return localStorage.getItem('eci_selected_form') || 'FORM_6';
  });

  const handleLoginSuccess = (loggedInUser, chosenForm) => {
    setUser(loggedInUser);
    if (chosenForm) {
      localStorage.setItem('eci_selected_form', chosenForm);
      setSelectedCitizenForm(chosenForm);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('eci_user');
    localStorage.removeItem('eci_token');
    setUser(null);
  };

  return (
<<<<<<< HEAD
    <MainLayout user={user} onLogout={handleLogout}>
      {!user && <AuthPortal onLoginSuccess={handleLoginSuccess} />}
      {user && user.role === 'CITIZEN' && (
        <CitizenPanel
          user={user}
          initialForm={selectedCitizenForm}
          onSwitchForm={(f) => {
            setSelectedCitizenForm(f);
            localStorage.setItem('eci_selected_form', f);
          }}
        />
      )}
      {user && user.role === 'BLO' && <BLOPanel user={user} />}
      {user && user.role === 'ERO' && <EROPanel user={user} />}
    </MainLayout>
  );
}
=======
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wide">Election Commission of India (ECI)</h1>
            <p className="text-xs text-blue-200">Electoral Roll Revision & Verification System (Forms 6, 7, 8)</p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="font-semibold">
                  {user.name}
                  <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded ml-2">
                    {user.role}
                  </span>
                </p>
                {user.staffKey && <p className="text-xs text-blue-200 font-mono">Key: {maskKey(user.staffKey)}</p>}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded font-semibold"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {!user && <AuthPortal onLoginSuccess={handleLoginSuccess} />}
        {user && user.role === 'CITIZEN' && (
          <CitizenPanel
            user={user}
            initialForm={selectedCitizenForm}
            onSwitchForm={(f) => {
              setSelectedCitizenForm(f);
              localStorage.setItem('eci_selected_form', f);
            }}
          />
        )}
        {user && user.role === 'BLO' && <BLOPanel user={user} />}
        {user && user.role === 'ERO' && <EROPanel user={user} />}
      </main>
    </div>
  );
}

/* ============================================================================
   1. AUTH PORTAL: CITIZEN (CHOOSE FORM 6/7/8 AT LOGIN) & COMBINED STAFF (BLO/ERO)
============================================================================ */
function AuthPortal({ onLoginSuccess }) {
  const [portalType, setPortalType] = useState('CITIZEN'); // CITIZEN | STAFF
  const [mode, setMode] = useState('LOGIN'); // LOGIN | REGISTER
  const [chosenForm, setChosenForm] = useState('FORM_6'); // FORM_6 | FORM_7 | FORM_8
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
        const res = await axios.post(`${API}/auth/register`, { ...form, portalType });
        setMessage({ text: res.data.message, isError: false });
        setMode('LOGIN');
      } else {
        const res = await axios.post(`${API}/auth/login`, { ...form, portalType });
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
      {/* 2 TABS: CITIZEN PORTAL & COMBINED STAFF PORTAL (BLO + ERO) */}
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
                : 'Combined login for BLO and ERO. Role is automatically detected from your 16-digit key.'}
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

          {/* CITIZEN CHOOSES FORM 6, 7, OR 8 AT LOGIN TIME */}
          {portalType === 'CITIZEN' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-2">
              <label className="block text-xs font-bold text-blue-900 uppercase">
                Select Form to Open Upon Login
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

          {/* COMBINED STAFF KEY INPUT (AUTO-DETECTS BLO OR ERO) */}
          {portalType === 'STAFF' && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded">
              <label className="block text-sm font-bold text-amber-900 mb-1">
                16-Digit Official Staff Key (BLO Key or ERO Console Key)
              </label>
              <input
                type="text"
                required
                placeholder="Enter 16-digit BLO or ERO security key"
                className="w-full border p-2 rounded font-mono tracking-widest bg-white"
                value={form.staffKey}
                onChange={(e) => setForm({ ...form, staffKey: e.target.value })}
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

/* ============================================================================
   2. CITIZEN PANEL (COMPLETE OFFICIAL FORMS 6, 7, AND 8)
============================================================================ */
function CitizenPanel({ user, initialForm, onSwitchForm }) {
  const [formType, setFormType] = useState(initialForm || 'FORM_6');
  const [myApps, setMyApps] = useState([]);

  // --- FORM 6 STATE (NEW VOTER REGISTRATION) ---
  const [f6, setF6] = useState({
    firstName: '',
    middleName: '',
    surname: '',
    nameRegional: '',
    dob: '',
    gender: 'Male',
    relName: '',
    relSurname: '',
    relType: 'Father',
    relEpic: '',
    mobile: '',
    email: '',
    houseNo: '',
    street: '',
    villageTown: '',
    postOffice: '',
    pinCode: '',
    tehsil: '',
    district: '',
    state: 'Rajasthan',
    pwdCategory: 'None',
    pwdPercentage: '',
    photoAttached: true,
    dobProof: 'Birth Certificate',
    addressProof: 'Water / Electricity / Gas Utility Bill',
    birthVillage: '',
    birthDistrict: '',
    birthState: 'Rajasthan',
    residingSince: '',
    citizenDeclaration: true
  });

  // --- FORM 7 STATE (OBJECTIONS & DELETIONS) ---
  const [f7, setF7] = useState({
    applicantName: user.name || '',
    applicantEpic: '',
    applicantMobile: '',
    actionSelected: "Request to delete someone else's name",
    deletionReason: 'Death',
    targetFirstName: '',
    targetSurname: '',
    targetEpic: '',
    targetHouseNo: '',
    targetStreet: '',
    targetVillage: '',
    targetPostOffice: '',
    targetPinCode: '',
    targetDistrict: '',
    deathCertificateAttached: true
  });

  // --- FORM 8 STATE (CORRECTIONS, SHIFTING, REPLACEMENT EPIC, PWD) ---
  const [f8, setF8] = useState({
    applicantName: user.name || '',
    applicantEpic: '',
    applicantMobile: '',
    purpose: 'SHIFTING', // SHIFTING | CORRECTION | REPLACEMENT_EPIC | PWD_MARKING
    // Shifting fields
    shiftType: 'Within Same Constituency',
    newHouseNo: '',
    newStreet: '',
    newVillage: '',
    newPostOffice: '',
    newPinCode: '',
    newTehsil: '',
    newDistrict: '',
    newState: 'Rajasthan',
    shiftAddressProof: 'Water / Electricity / Gas Utility Bill',
    // Correction fields
    correctionField: 'Name Spelling',
    correctedValue: '',
    correctionDocProof: 'PAN Card',
    // Replacement EPIC fields
    replacementReason: 'Lost',
    replacementAttachment: 'Copy of FIR / Police Complaint',
    // PwD fields
    pwdCategory: 'Locomotor',
    pwdPercentage: '',
    pwdAttachment: 'Official Medical Disability Certificate'
  });

  const loadMyApps = async () => {
    const res = await axios.get(`${API}/applications/citizen/${user.id}`);
    setMyApps(res.data);
  };

  useEffect(() => {
    loadMyApps();
  }, []);

  const changeTab = (type) => {
    setFormType(type);
    onSwitchForm(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payloadData = {};

    if (formType === 'FORM_6') {
      if (!f6.photoAttached || !f6.citizenDeclaration) {
        alert('Please tick the mandatory Photograph and Citizenship Declaration checkboxes.');
        return;
      }
      const fullName = [f6.firstName, f6.middleName, f6.surname].filter(Boolean).join(' ');
      const fullAddress = `${f6.houseNo}, ${f6.street}, ${f6.villageTown}, PO: ${f6.postOffice}, Tehsil: ${f6.tehsil}, Dist: ${f6.district}, ${f6.state} - ${f6.pinCode}`;

      payloadData = {
        applicantName: `${fullName} (${f6.nameRegional})`,
        ageOrDob: `${f6.dob} (${f6.gender})`,
        address: fullAddress,
        reasonOrCorrection: `Relative: ${f6.relName} ${f6.relSurname} (${f6.relType}${f6.relEpic ? ', EPIC: ' + f6.relEpic : ''}) | Born: ${f6.birthVillage}, ${f6.birthDistrict}, ${f6.birthState} | Residing Since: ${f6.residingSince} | PwD: ${f6.pwdCategory}${f6.pwdPercentage ? ' (' + f6.pwdPercentage + '%)' : ''}`,
        documentProvided: `1. Passport Photo (White BG) | 2. DOB Proof: ${f6.dobProof} | 3. Address Proof: ${f6.addressProof}`,
        rawDetails: f6
      };
    } else if (formType === 'FORM_7') {
      if (f7.deletionReason === 'Death' && !f7.deathCertificateAttached) {
        alert('Death Certificate attachment confirmation is mandatory for Deletion due to Death.');
        return;
      }
      const targetFullName = `${f7.targetFirstName} ${f7.targetSurname}`.trim();
      const targetAddress = `${f7.targetHouseNo}, ${f7.targetStreet}, ${f7.targetVillage}, PO: ${f7.targetPostOffice}, Dist: ${f7.targetDistrict} - ${f7.targetPinCode}`;

      payloadData = {
        applicantName: `Target: ${targetFullName} (Target EPIC: ${f7.targetEpic || 'N/A'})`,
        ageOrDob: `Filed by: ${f7.applicantName} (EPIC: ${f7.applicantEpic}, Mob: ${f7.applicantMobile})`,
        address: targetAddress,
        reasonOrCorrection: `Action: ${f7.actionSelected} | Reason: ${f7.deletionReason}`,
        documentProvided:
          f7.deletionReason === 'Death'
            ? 'Death Certificate Attached'
            : 'Form 7 Statutory Objection Declaration',
        rawDetails: f7
      };
    } else if (formType === 'FORM_8') {
      let summaryReason = '';
      let summaryDoc = '';
      let summaryAddress = 'Existing Electoral Roll Address';

      if (f8.purpose === 'SHIFTING') {
        summaryAddress = `${f8.newHouseNo}, ${f8.newStreet}, ${f8.newVillage}, PO: ${f8.newPostOffice}, Tehsil: ${f8.newTehsil}, Dist: ${f8.newDistrict}, ${f8.newState} - ${f8.newPinCode}`;
        summaryReason = `Shifting of Residence (${f8.shiftType})`;
        summaryDoc = `New Address Proof: ${f8.shiftAddressProof}`;
      } else if (f8.purpose === 'CORRECTION') {
        summaryReason = `Correction of Entries (${f8.correctionField} -> "${f8.correctedValue}")`;
        summaryDoc = `Supporting Document: ${f8.correctionDocProof}`;
      } else if (f8.purpose === 'REPLACEMENT_EPIC') {
        summaryReason = `Issue of Replacement EPIC (Reason: ${f8.replacementReason})`;
        summaryDoc =
          f8.replacementReason === 'Lost'
            ? 'Copy of FIR / Police Complaint'
            : f8.replacementReason === 'Destroyed/Mutilated'
            ? 'Surrender Damaged EPIC Card to BLO/ERO'
            : 'Standard EPIC Reprint Request';
      } else if (f8.purpose === 'PWD_MARKING') {
        summaryReason = `Request for Marking as PwD (${f8.pwdCategory} - ${f8.pwdPercentage}%)`;
        summaryDoc = f8.pwdAttachment;
      }

      payloadData = {
        applicantName: `${f8.applicantName} (EPIC: ${f8.applicantEpic})`,
        ageOrDob: `Mobile: ${f8.applicantMobile}`,
        address: summaryAddress,
        reasonOrCorrection: summaryReason,
        documentProvided: summaryDoc,
        rawDetails: f8
      };
    }

    await axios.post(`${API}/applications`, {
      citizenId: user.id,
      citizenName: user.name,
      formType,
      formData: payloadData
    });

    alert(`${formType} submitted! It is now visible in the BLO Officer panel for house verification.`);
    loadMyApps();
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* LEFT 7 COLS: DETAILED STATUTORY FORMS */}
      <div className="lg:col-span-7 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Submit ECI Statutory Application</h2>
          <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded">
            Active Form: {formType.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => changeTab('FORM_6')}
            className={`p-2.5 rounded font-bold text-xs ${
              formType === 'FORM_6' ? 'bg-blue-700 text-white shadow' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Form 6 (New Voter Registration)
          </button>
          <button
            type="button"
            onClick={() => changeTab('FORM_7')}
            className={`p-2.5 rounded font-bold text-xs ${
              formType === 'FORM_7' ? 'bg-red-700 text-white shadow' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Form 7 (Objection / Deletion)
          </button>
          <button
            type="button"
            onClick={() => changeTab('FORM_8')}
            className={`p-2.5 rounded font-bold text-xs ${
              formType === 'FORM_8' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-700'
            }`}
          >
            Form 8 (Correction / Shift / EPIC)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* =================================================================
              FORM 6: NEW VOTER REGISTRATION (COMPLETE BASELINE DATA)
          ================================================================= */}
          {formType === 'FORM_6' && (
            <div className="space-y-4">
              {/* 1. Personal Details */}
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-1">
                  1. Personal Details
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="First Name (English)"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.firstName}
                    onChange={(e) => setF6({ ...f6, firstName: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Middle Name"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.middleName}
                    onChange={(e) => setF6({ ...f6, middleName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Surname"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.surname}
                    onChange={(e) => setF6({ ...f6, surname: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name in State Language (e.g. हिन्दी)"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.nameRegional}
                    onChange={(e) => setF6({ ...f6, nameRegional: e.target.value })}
                  />
                  <div>
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="border p-2 rounded text-sm bg-white w-full"
                      value={f6.dob}
                      onChange={(e) => setF6({ ...f6, dob: e.target.value })}
                    />
                  </div>
                  <select
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.gender}
                    onChange={(e) => setF6({ ...f6, gender: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Third Gender</option>
                  </select>
                </div>
              </div>

              {/* 2. Relative's Details & Contact Info */}
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-1">
                  2. Relative's Details & Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Relative's First Name"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.relName}
                    onChange={(e) => setF6({ ...f6, relName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Relative's Surname"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.relSurname}
                    onChange={(e) => setF6({ ...f6, relSurname: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.relType}
                    onChange={(e) => setF6({ ...f6, relType: e.target.value })}
                  >
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Husband</option>
                    <option>Wife</option>
                    <option>Legal Guardian</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Relative's EPIC No. (If residing with you)"
                    className="border p-2 rounded text-sm bg-white font-mono uppercase"
                    value={f6.relEpic}
                    onChange={(e) => setF6({ ...f6, relEpic: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number (Self or Relative)"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.mobile}
                    onChange={(e) => setF6({ ...f6, mobile: e.target.value })}
                  />
                  <input
                    type="email"
                    placeholder="Email ID (Optional)"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.email}
                    onChange={(e) => setF6({ ...f6, email: e.target.value })}
                  />
                </div>
              </div>

              {/* 3. Complete Present Address */}
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-1">
                  3. Complete Present Address (For BLO Visit)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="House / Building / Apartment No."
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.houseNo}
                    onChange={(e) => setF6({ ...f6, houseNo: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Locality / Road"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.street}
                    onChange={(e) => setF6({ ...f6, street: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Village / Town"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.villageTown}
                    onChange={(e) => setF6({ ...f6, villageTown: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Post Office"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.postOffice}
                    onChange={(e) => setF6({ ...f6, postOffice: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.pinCode}
                    onChange={(e) => setF6({ ...f6, pinCode: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Tehsil / Mandal"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.tehsil}
                    onChange={(e) => setF6({ ...f6, tehsil: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="District"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.district}
                    onChange={(e) => setF6({ ...f6, district: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.state}
                    onChange={(e) => setF6({ ...f6, state: e.target.value })}
                  />
                </div>
              </div>

              {/* 4. Optional Disability (PwD) & Required Attachments */}
              <div className="border p-4 rounded bg-blue-50 border-blue-200 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b border-blue-200 pb-1">
                  4. Disability Information (Optional) & Required Attachments
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.pwdCategory}
                    onChange={(e) => setF6({ ...f6, pwdCategory: e.target.value })}
                  >
                    <option value="None">No Disability (Not Applicable)</option>
                    <option value="Locomotor">Locomotor Disability</option>
                    <option value="Visual">Visual Impairment</option>
                    <option value="Deaf and Dumb">Deaf and Dumb</option>
                    <option value="Other">Other Disability</option>
                  </select>
                  {f6.pwdCategory !== 'None' && (
                    <input
                      type="number"
                      placeholder="Disability Percentage (%)"
                      className="border p-2 rounded text-sm bg-white"
                      value={f6.pwdPercentage}
                      onChange={(e) => setF6({ ...f6, pwdPercentage: e.target.value })}
                    />
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f6.photoAttached}
                    onChange={(e) => setF6({ ...f6, photoAttached: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Attachment 1: One recent passport-size color photograph with a white background
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Attachment 2: Proof of Date of Birth
                    </label>
                    <select
                      className="border p-2 rounded text-sm bg-white w-full mt-1"
                      value={f6.dobProof}
                      onChange={(e) => setF6({ ...f6, dobProof: e.target.value })}
                    >
                      <option>Birth Certificate</option>
                      <option>Aadhaar Card</option>
                      <option>Class 10/12 Mark Sheet</option>
                      <option>PAN Card</option>
                      <option>Indian Passport</option>
                      <option>Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Attachment 3: Proof of Address
                    </label>
                    <select
                      className="border p-2 rounded text-sm bg-white w-full mt-1"
                      value={f6.addressProof}
                      onChange={(e) => setF6({ ...f6, addressProof: e.target.value })}
                    >
                      <option>Water / Electricity / Gas Utility Bill</option>
                      <option>Aadhaar Card</option>
                      <option>Bank / Post Office Passbook</option>
                      <option>Registered Rent / Lease Deed</option>
                      <option>Indian Passport</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Mandatory Declaration */}
              <div className="border p-4 rounded bg-amber-50 border-amber-200 space-y-3">
                <h3 className="text-sm font-bold text-amber-900 uppercase border-b border-amber-200 pb-1">
                  5. Mandatory Citizen Declaration
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Birth Village / Town"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.birthVillage}
                    onChange={(e) => setF6({ ...f6, birthVillage: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Birth District"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.birthDistrict}
                    onChange={(e) => setF6({ ...f6, birthDistrict: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Birth State"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.birthState}
                    onChange={(e) => setF6({ ...f6, birthState: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Residing at Current Address Since (Month & Year)
                  </label>
                  <input
                    type="month"
                    required
                    className="border p-2 rounded text-sm bg-white w-full mt-1"
                    value={f6.residingSince}
                    onChange={(e) => setF6({ ...f6, residingSince: e.target.value })}
                  />
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f6.citizenDeclaration}
                    onChange={(e) => setF6({ ...f6, citizenDeclaration: e.target.checked })}
                    className="w-4 h-4"
                  />
                  I declare that I am a citizen of India and do not hold citizenship of any other country.
                </label>
              </div>
            </div>
          )}

          {/* =================================================================
              FORM 7: OBJECTIONS AND DELETIONS
          ================================================================= */}
          {formType === 'FORM_7' && (
            <div className="space-y-4">
              {/* 1. Applicant's Details */}
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-red-900 uppercase border-b pb-1">
                  1. Applicant's Details (Must Be an Existing Registered Voter)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.applicantName}
                    onChange={(e) => setF7({ ...f7, applicantName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Your EPIC Number"
                    className="border p-2 rounded text-sm bg-white font-mono uppercase"
                    value={f7.applicantEpic}
                    onChange={(e) => setF7({ ...f7, applicantEpic: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Your Mobile Number"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.applicantMobile}
                    onChange={(e) => setF7({ ...f7, applicantMobile: e.target.value })}
                  />
                </div>
              </div>

              {/* 2. Action Selected & Reason for Deletion */}
              <div className="border p-4 rounded bg-red-50 border-red-200 space-y-3">
                <h3 className="text-sm font-bold text-red-900 uppercase border-b border-red-200 pb-1">
                  2. Action Selected & Reason for Deletion
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Select Action (Tick One)
                  </label>
                  <select
                    className="border p-2 rounded text-sm bg-white w-full mt-1"
                    value={f7.actionSelected}
                    onChange={(e) => setF7({ ...f7, actionSelected: e.target.value })}
                  >
                    <option>Request to delete someone else's name</option>
                    <option>Object to a proposed inclusion of a name</option>
                    <option>Delete your own name (Only valid if permanently shifting away)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Reason for Deletion
                  </label>
                  <select
                    className="border p-2 rounded text-sm bg-white w-full mt-1"
                    value={f7.deletionReason}
                    onChange={(e) => setF7({ ...f7, deletionReason: e.target.value })}
                  >
                    <option value="Death">Death</option>
                    <option value="Underage">Underage</option>
                    <option value="Permanently Shifted">Permanently Shifted</option>
                    <option value="Already Enrolled (Duplicate)">Already Enrolled (Duplicate)</option>
                    <option value="Not an Indian Citizen">Not an Indian Citizen</option>
                  </select>
                </div>

                {f7.deletionReason === 'Death' && (
                  <label className="flex items-center gap-2 text-xs font-bold text-red-900 bg-white p-2.5 rounded border border-red-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={f7.deathCertificateAttached}
                      onChange={(e) => setF7({ ...f7, deathCertificateAttached: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Required Attachment: Death Certificate of the deceased voter is attached
                  </label>
                )}
              </div>

              {/* 3. Details of the Person to be Deleted */}
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-red-900 uppercase border-b pb-1">
                  3. Details of the Person to be Deleted / Challenged
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="First / Middle Name"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetFirstName}
                    onChange={(e) => setF7({ ...f7, targetFirstName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Surname"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetSurname}
                    onChange={(e) => setF7({ ...f7, targetSurname: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="EPIC No. (If available)"
                    className="border p-2 rounded text-sm bg-white font-mono uppercase"
                    value={f7.targetEpic}
                    onChange={(e) => setF7({ ...f7, targetEpic: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="House No."
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetHouseNo}
                    onChange={(e) => setF7({ ...f7, targetHouseNo: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Locality"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetStreet}
                    onChange={(e) => setF7({ ...f7, targetStreet: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Village / Town"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetVillage}
                    onChange={(e) => setF7({ ...f7, targetVillage: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Post Office"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetPostOffice}
                    onChange={(e) => setF7({ ...f7, targetPostOffice: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetPinCode}
                    onChange={(e) => setF7({ ...f7, targetPinCode: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="District"
                    className="border p-2 rounded text-sm bg-white"
                    value={f7.targetDistrict}
                    onChange={(e) => setF7({ ...f7, targetDistrict: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              FORM 8: CORRECTIONS, SHIFTING, REPLACEMENT EPIC, PWD
          ================================================================= */}
          {formType === 'FORM_8' && (
            <div className="space-y-4">
              {/* 1. Applicant's Base Details */}
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                  1. Applicant's Base Details
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Current Name"
                    className="border p-2 rounded text-sm bg-white"
                    value={f8.applicantName}
                    onChange={(e) => setF8({ ...f8, applicantName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Your EPIC Number"
                    className="border p-2 rounded text-sm bg-white font-mono uppercase"
                    value={f8.applicantEpic}
                    onChange={(e) => setF8({ ...f8, applicantEpic: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number"
                    className="border p-2 rounded text-sm bg-white"
                    value={f8.applicantMobile}
                    onChange={(e) => setF8({ ...f8, applicantMobile: e.target.value })}
                  />
                </div>
              </div>

              {/* 2. Application Purpose Selector */}
              <div className="border p-4 rounded bg-emerald-50 border-emerald-200 space-y-3">
                <h3 className="text-sm font-bold text-emerald-900 uppercase border-b border-emerald-200 pb-1">
                  2. Application Purpose (Tick Exact Service Needed)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'SHIFTING', label: '1. Shifting of Residence' },
                    { id: 'CORRECTION', label: '2. Correction of Entries' },
                    { id: 'REPLACEMENT_EPIC', label: '3. Issue of Replacement EPIC' },
                    { id: 'PWD_MARKING', label: '4. Request for Marking as PwD' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setF8({ ...f8, purpose: item.id })}
                      className={`p-2.5 rounded text-xs font-bold border text-left ${
                        f8.purpose === item.id
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3A. CONDITIONAL SECTION: SHIFTING OF RESIDENCE */}
              {f8.purpose === 'SHIFTING' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. New Address Details & Proof (For Shifting of Residence)
                  </h3>
                  <select
                    className="border p-2 rounded text-sm bg-white w-full"
                    value={f8.shiftType}
                    onChange={(e) => setF8({ ...f8, shiftType: e.target.value })}
                  >
                    <option>Within Same Constituency</option>
                    <option>To a New Constituency</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="New House / Apartment No."
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newHouseNo}
                      onChange={(e) => setF8({ ...f8, newHouseNo: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="New Street / Locality"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newStreet}
                      onChange={(e) => setF8({ ...f8, newStreet: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Village / Town"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newVillage}
                      onChange={(e) => setF8({ ...f8, newVillage: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Post Office"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newPostOffice}
                      onChange={(e) => setF8({ ...f8, newPostOffice: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="PIN Code"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newPinCode}
                      onChange={(e) => setF8({ ...f8, newPinCode: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Tehsil / Mandal"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newTehsil}
                      onChange={(e) => setF8({ ...f8, newTehsil: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="District"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newDistrict}
                      onChange={(e) => setF8({ ...f8, newDistrict: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.newState}
                      onChange={(e) => setF8({ ...f8, newState: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Required Attachment: Valid Proof of New Address
                    </label>
                    <select
                      className="border p-2 rounded text-sm bg-white w-full mt-1"
                      value={f8.shiftAddressProof}
                      onChange={(e) => setF8({ ...f8, shiftAddressProof: e.target.value })}
                    >
                      <option>Water / Electricity / Gas Utility Bill</option>
                      <option>Aadhaar Card</option>
                      <option>Registered Rent / Lease Deed</option>
                      <option>Current Bank / Post Office Passbook</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 3B. CONDITIONAL SECTION: CORRECTION OF ENTRIES */}
              {f8.purpose === 'CORRECTION' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. New / Corrected Details & Supporting Document
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        Entry to Correct
                      </label>
                      <select
                        className="border p-2 rounded text-sm bg-white w-full mt-1"
                        value={f8.correctionField}
                        onChange={(e) => setF8({ ...f8, correctionField: e.target.value })}
                      >
                        <option>Name Spelling</option>
                        <option>Relative's Name</option>
                        <option>Date of Birth / Age</option>
                        <option>Gender</option>
                        <option>Photograph</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700">
                        Correct Value / New Detail
                      </label>
                      <input
                        type={f8.correctionField === 'Date of Birth / Age' ? 'date' : 'text'}
                        required
                        placeholder="Enter correct detail"
                        className="border p-2 rounded text-sm bg-white w-full mt-1"
                        value={f8.correctedValue}
                        onChange={(e) => setF8({ ...f8, correctedValue: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Required Attachment: Document Proving the Correct Detail
                    </label>
                    <select
                      className="border p-2 rounded text-sm bg-white w-full mt-1"
                      value={f8.correctionDocProof}
                      onChange={(e) => setF8({ ...f8, correctionDocProof: e.target.value })}
                    >
                      <option>PAN Card</option>
                      <option>Birth Certificate</option>
                      <option>Class 10/12 Certificate / Mark Sheet</option>
                      <option>Aadhaar Card</option>
                      <option>Marriage Certificate (Surname Change)</option>
                      <option>New Passport-Size Color Photograph</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 3C. CONDITIONAL SECTION: ISSUE OF REPLACEMENT EPIC */}
              {f8.purpose === 'REPLACEMENT_EPIC' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. Reason for Replacement EPIC & Required Attachment
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Reason for Replacement EPIC
                    </label>
                    <select
                      className="border p-2 rounded text-sm bg-white w-full mt-1"
                      value={f8.replacementReason}
                      onChange={(e) => setF8({ ...f8, replacementReason: e.target.value })}
                    >
                      <option value="Lost">Lost</option>
                      <option value="Destroyed/Mutilated">
                        Destroyed / Mutilated due to disaster or wear
                      </option>
                      <option value="Need new card without corrections">
                        Need a new card without corrections
                      </option>
                    </select>
                  </div>
                  <div className="bg-white p-3 rounded border text-xs text-slate-700">
                    <strong>Required Attachment: </strong>
                    {f8.replacementReason === 'Lost' &&
                      'Attach a copy of the FIR or Police Complaint.'}
                    {f8.replacementReason === 'Destroyed/Mutilated' &&
                      'You must hand over the old, damaged Voter ID card to the BLO / ERO.'}
                    {f8.replacementReason === 'Need new card without corrections' &&
                      'Identity confirmation for reprint without changes.'}
                  </div>
                </div>
              )}

              {/* 3D. CONDITIONAL SECTION: REQUEST FOR MARKING AS PWD */}
              {f8.purpose === 'PWD_MARKING' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. Person with Disability (PwD) Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.pwdCategory}
                      onChange={(e) => setF8({ ...f8, pwdCategory: e.target.value })}
                    >
                      <option value="Locomotor">Locomotor Disability</option>
                      <option value="Visual">Visual Impairment</option>
                      <option value="Deaf and Dumb">Deaf and Dumb</option>
                      <option value="Other">Other Disability</option>
                    </select>
                    <input
                      type="number"
                      required
                      placeholder="Disability Percentage (%)"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.pwdPercentage}
                      onChange={(e) => setF8({ ...f8, pwdPercentage: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded shadow">
            Submit {formType.replace('_', ' ')} Application to BLO Officer
          </button>
        </form>
      </div>

      {/* RIGHT 5 COLS: CITIZEN'S SUBMITTED APPLICATIONS */}
      <div className="lg:col-span-5 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">My Submitted Applications</h2>
        {myApps.length === 0 ? (
          <p className="text-slate-500 text-sm">You have not submitted any forms yet.</p>
        ) : (
          <div className="space-y-3 max-h-screen overflow-y-auto">
            {myApps.map((app) => (
              <div key={app._id} className="border p-4 rounded bg-slate-50 space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-blue-900 text-sm">
                    {app.formType} — {app.formData?.applicantName}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      app.status === 'BLO_APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status === 'BLO_APPROVED' ? 'Verified by BLO' : 'Pending BLO Visit'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Info:</strong> {app.formData?.ageOrDob}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Address:</strong> {app.formData?.address}
                </p>
                <p className="text-xs text-slate-600">
                  <strong>Details:</strong> {app.formData?.reasonOrCorrection}
                </p>
                <p className="text-xs text-slate-700 bg-white p-2 rounded border mt-1">
                  <strong>Attachments:</strong> {app.formData?.documentProvided}
                </p>
                {app.status === 'BLO_APPROVED' && (
                  <p className="text-xs text-green-700 font-semibold pt-1">
                    Approved by BLO {app.verifiedByBloName} (Key: {maskKey(app.verifiedByBloKey)})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   3. BLO OFFICER PANEL (HIDES ERO LOGS FROM BLO VIEW)
============================================================================ */
function BLOPanel({ user }) {
  const [applications, setApplications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [checkedDocs, setCheckedDocs] = useState({});

  const loadData = async () => {
    const [appsRes, logsRes] = await Promise.all([
      axios.get(`${API}/applications/all`),
      axios.get(`${API}/audit-logs`)
    ]);
    setApplications(appsRes.data);
    setAuditLogs(logsRes.data.filter((log) => log.actorRole !== 'ERO'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (appId) => {
    if (!checkedDocs[appId]) {
      alert('Please tick the verification checkbox confirming you visited the house and checked the documents.');
      return;
    }

    await axios.put(`${API}/applications/${appId}/approve`, {
      bloName: user.name,
      bloKey: user.staffKey,
      verificationNote: 'House visited and physical documents verified.'
    });

    loadData();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-1">Citizen Applications (BLO Field Verification)</h2>
        <p className="text-xs text-slate-500 mb-4">
          Visit the citizen's house address, verify physical attachments, tick confirmation, and approve.
        </p>

        {applications.length === 0 ? (
          <p className="text-sm text-slate-500">No citizen applications submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="border p-4 rounded-lg bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-900 text-xs font-bold px-2 py-0.5 rounded mr-2">
                      {app.formType}
                    </span>
                    <span className="font-bold text-base">{app.formData?.applicantName}</span>
                    <p className="text-xs text-slate-500">Submitted by Citizen: {app.citizenName}</p>
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

                <div className="mt-3 text-xs space-y-1 bg-white p-3 rounded border">
                  <p><strong>Address:</strong> {app.formData?.address}</p>
                  <p><strong>DOB / Applicant Info:</strong> {app.formData?.ageOrDob}</p>
                  <p><strong>Form Details:</strong> {app.formData?.reasonOrCorrection}</p>
                  <p><strong>Attachments to Verify:</strong> {app.formData?.documentProvided}</p>
                </div>

                {app.status === 'PENDING_BLO' ? (
                  <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={!!checkedDocs[app._id]}
                        onChange={(e) => setCheckedDocs({ ...checkedDocs, [app._id]: e.target.checked })}
                      />
                      I visited the house & manually verified the physical documents
                    </label>
                    <button
                      onClick={() => handleApprove(app._id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Tick & Approve Application (Save with Key {maskKey(user.staffKey)})
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-emerald-700 font-semibold">
                    Verified by BLO {app.verifiedByBloName} (BLO Key: {maskKey(app.verifiedByBloKey)})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SharedAuditLog logs={auditLogs} />
    </div>
  );
}

/* ============================================================================
   4. ERO OFFICER PANEL
============================================================================ */
function EROPanel({ user }) {
  const [applications, setApplications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [bloKeys, setBloKeys] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [inspectedBlo, setInspectedBlo] = useState(null);

  const loadAll = async () => {
    const [appsRes, logsRes, keysRes] = await Promise.all([
      axios.get(`${API}/applications/all`),
      axios.get(`${API}/audit-logs`),
      axios.get(`${API}/ero/keys`)
    ]);
    setApplications(appsRes.data);
    setAuditLogs(logsRes.data);
    setBloKeys(keysRes.data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleGenerateBloKey = async () => {
    const res = await axios.post(`${API}/ero/generate-blo-key`, {
      eroName: user.name,
      eroKey: user.staffKey
    });
    alert(`New 16-Digit BLO Key Generated: ${res.data.key}`);
    loadAll();
  };

  const handleInspectKey = async (keyToCheck) => {
    const target = keyToCheck || searchKey;
    if (!target) return;
    setSearchKey(target);
    const res = await axios.get(`${API}/ero/blo-work/${target}`);
    setInspectedBlo(res.data);
  };

  const pendingCount = applications.filter((a) => a.status === 'PENDING_BLO').length;
  const approvedCount = applications.filter((a) => a.status === 'BLO_APPROVED').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-600">
          <p className="text-xs text-slate-500 font-bold uppercase">Total Citizen Forms</p>
          <p className="text-3xl font-black">{applications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-amber-500">
          <p className="text-xs text-slate-500 font-bold uppercase">Pending House Visit</p>
          <p className="text-3xl font-black">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-emerald-600">
          <p className="text-xs text-slate-500 font-bold uppercase">Approved by BLOs</p>
          <p className="text-3xl font-black">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-t-4 border-purple-600">
          <p className="text-xs text-slate-500 font-bold uppercase">Generated BLO Keys</p>
          <p className="text-3xl font-black">{bloKeys.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold">1. Generate 16-Digit BLO Login Keys</h2>
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
            Insert any BLO key to inspect only that BLO officer's verified forms.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Paste 16-digit BLO Key here..."
              className="border p-2 rounded w-full font-mono text-sm"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
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

/* ============================================================================
   5. SHARED AUDIT LOG COMPONENT (MASKS KEYS AS 50xxxx85)
============================================================================ */
function SharedAuditLog({ logs }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-1">System-Wide Audit Log</h2>
      <p className="text-xs text-slate-500 mb-4">
        Live record of Citizen form submissions and BLO house verifications (keys masked as 50xxxx85).
      </p>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {logs.map((log) => (
          <div key={log._id} className="border-l-4 border-blue-800 bg-slate-50 p-3 rounded text-sm">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-slate-800">
                [{log.actorRole}] {log.actorName}{' '}
                {log.staffKey && log.staffKey !== 'N/A' ? `(Key: ${maskKey(log.staffKey)})` : ''}
              </span>
              <span>{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <p className="font-semibold text-blue-900 text-xs">{log.action}</p>
            <p className="text-xs text-slate-700 mt-0.5">{maskKeysInText(log.details)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
>>>>>>> 70108038339f07e1273cf82609242007d0340237
