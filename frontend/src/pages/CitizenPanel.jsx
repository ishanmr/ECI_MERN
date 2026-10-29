import { useState, useEffect } from 'react';
import api from '../services/api';
import { maskKey } from '../utils/maskHelper';

export default function CitizenPanel({ user, initialForm, onSwitchForm }) {
  const [formType, setFormType] = useState(initialForm || 'FORM_6');
  const [myApps, setMyApps] = useState([]);

  // Form 6 State
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

  // Form 7 State
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

  // Form 8 State
  const [f8, setF8] = useState({
    applicantName: user.name || '',
    applicantEpic: '',
    applicantMobile: '',
    purpose: 'SHIFTING',
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
    correctionField: 'Name Spelling',
    correctedValue: '',
    correctionDocProof: 'PAN Card',
    replacementReason: 'Lost',
    pwdCategory: 'Locomotor',
    pwdPercentage: '',
    pwdAttachment: 'Official Medical Disability Certificate'
  });

  const loadMyApps = async () => {
    try {
      const res = await api.get(`/applications/citizen/${user.id}`);
      setMyApps(res.data);
    } catch (err) {
      console.error('Error loading citizen applications:', err);
    }
  };

  useEffect(() => {
    loadMyApps();
  }, []);

  const changeTab = (type) => {
    setFormType(type);
    if (onSwitchForm) onSwitchForm(type);
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
        documentProvided: `1. Passport Photo (White BG) | 2. DOB Proof: ${f6.dobProof} | 3. Address Proof: ${f6.addressProof}`
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
            : 'Form 7 Statutory Objection Declaration'
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
        summaryReason = `Correction of Entries (${f8.correctionField}: "${f8.correctedValue}")`;
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
        documentProvided: summaryDoc
      };
    }

    await api.post('/applications', {
      formType,
      formData: payloadData
    });

    alert(`${formType} submitted! It is now visible in the BLO Officer panel for house verification.`);
    loadMyApps();
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
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
          {formType === 'FORM_6' && (
            <div className="space-y-4">
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
                    placeholder="Full Name in State Language"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.nameRegional}
                    onChange={(e) => setF6({ ...f6, nameRegional: e.target.value })}
                  />
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="border p-2 rounded text-sm bg-white w-full"
                    value={f6.dob}
                    onChange={(e) => setF6({ ...f6, dob: e.target.value })}
                  />
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

              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-1">
                  2. Relative Details & Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Relative First Name"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.relName}
                    onChange={(e) => setF6({ ...f6, relName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Relative Surname"
                    className="border p-2 rounded text-sm bg-white"
                    value={f6.relSurname}
                    onChange={(e) => setF6({ ...f6, relSurname: e.target.value })}
                  />
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
                    placeholder="Relative EPIC No. (If registered)"
                    className="border p-2 rounded text-sm bg-white font-mono uppercase"
                    value={f6.relEpic}
                    onChange={(e) => setF6({ ...f6, relEpic: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number"
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

              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-1">
                  3. Complete Present Address
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

              <div className="border p-4 rounded bg-blue-50 border-blue-200 space-y-3">
                <h3 className="text-sm font-bold text-blue-900 uppercase border-b border-blue-200 pb-1">
                  4. Disability Info (Optional) & Required Attachments
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
                      <option>PAN Card</option>
                      <option>Driving License</option>
                      <option>Class 10/12 Certificate / Mark Sheet</option>
                      <option>Indian Passport</option>
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
                      <option>Current Bank / Post Office Passbook</option>
                      <option>Registered Rent / Lease Deed</option>
                      <option>Indian Passport</option>
                    </select>
                  </div>
                </div>
              </div>

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

          {formType === 'FORM_7' && (
            <div className="space-y-4">
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-red-900 uppercase border-b pb-1">
                  1. Applicant Details (Existing Registered Voter)
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

              <div className="border p-4 rounded bg-red-50 border-red-200 space-y-3">
                <h3 className="text-sm font-bold text-red-900 uppercase border-b border-red-200 pb-1">
                  2. Action Selected & Reason for Deletion
                </h3>
                <select
                  className="border p-2 rounded text-sm bg-white w-full"
                  value={f7.actionSelected}
                  onChange={(e) => setF7({ ...f7, actionSelected: e.target.value })}
                >
                  <option>Request to delete someone else's name</option>
                  <option>Object to a proposed inclusion of a name</option>
                  <option>Delete your own name (Only valid if permanently shifting away)</option>
                </select>

                <select
                  className="border p-2 rounded text-sm bg-white w-full"
                  value={f7.deletionReason}
                  onChange={(e) => setF7({ ...f7, deletionReason: e.target.value })}
                >
                  <option value="Death">Death</option>
                  <option value="Underage">Underage</option>
                  <option value="Permanently Shifted">Permanently Shifted</option>
                  <option value="Already Enrolled (Duplicate)">Already Enrolled (Duplicate)</option>
                  <option value="Not an Indian Citizen">Not an Indian Citizen</option>
                </select>

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

              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-red-900 uppercase border-b pb-1">
                  3. Details of Person to be Deleted
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

          {formType === 'FORM_8' && (
            <div className="space-y-4">
              <div className="border p-4 rounded bg-slate-50 space-y-3">
                <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                  1. Applicant Base Details
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

              <div className="border p-4 rounded bg-emerald-50 border-emerald-200 space-y-3">
                <h3 className="text-sm font-bold text-emerald-900 uppercase border-b border-emerald-200 pb-1">
                  2. Application Purpose
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

              {f8.purpose === 'SHIFTING' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. New Address Details & Proof
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
                  <select
                    className="border p-2 rounded text-sm bg-white w-full"
                    value={f8.shiftAddressProof}
                    onChange={(e) => setF8({ ...f8, shiftAddressProof: e.target.value })}
                  >
                    <option>Water / Electricity / Gas Utility Bill</option>
                    <option>Aadhaar Card</option>
                    <option>Registered Rent / Lease Deed</option>
                    <option>Current Bank / Post Office Passbook</option>
                  </select>
                </div>
              )}

              {f8.purpose === 'CORRECTION' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. New / Corrected Details & Proof
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.correctionField}
                      onChange={(e) => setF8({ ...f8, correctionField: e.target.value })}
                    >
                      <option>Name Spelling</option>
                      <option>Relative Name</option>
                      <option>Date of Birth / Age</option>
                      <option>Gender</option>
                      <option>Photograph</option>
                    </select>
                    <input
                      type={f8.correctionField === 'Date of Birth / Age' ? 'date' : 'text'}
                      required
                      placeholder="Enter correct value"
                      className="border p-2 rounded text-sm bg-white"
                      value={f8.correctedValue}
                      onChange={(e) => setF8({ ...f8, correctedValue: e.target.value })}
                    />
                  </div>
                  <select
                    className="border p-2 rounded text-sm bg-white w-full"
                    value={f8.correctionDocProof}
                    onChange={(e) => setF8({ ...f8, correctionDocProof: e.target.value })}
                  >
                    <option>PAN Card</option>
                    <option>Aadhaar Card</option>
                    <option>Birth Certificate</option>
                    <option>Class 10/12 Certificate / Mark Sheet</option>
                    <option>Marriage Certificate (Surname Change)</option>
                    <option>New Passport-Size Color Photograph</option>
                  </select>
                </div>
              )}

              {f8.purpose === 'REPLACEMENT_EPIC' && (
                <div className="border p-4 rounded bg-slate-50 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase border-b pb-1">
                    3. Replacement EPIC Details
                  </h3>
                  <select
                    className="border p-2 rounded text-sm bg-white w-full"
                    value={f8.replacementReason}
                    onChange={(e) => setF8({ ...f8, replacementReason: e.target.value })}
                  >
                    <option value="Lost">Lost</option>
                    <option value="Destroyed/Mutilated">Destroyed / Mutilated</option>
                    <option value="Need new card without corrections">Need new card without corrections</option>
                  </select>
                  <div className="bg-white p-3 rounded border text-xs text-slate-700">
                    <strong>Required Attachment: </strong>
                    {f8.replacementReason === 'Lost' && 'Attach a copy of the FIR or Police Complaint.'}
                    {f8.replacementReason === 'Destroyed/Mutilated' && 'Hand over the damaged Voter ID card to the BLO / ERO.'}
                    {f8.replacementReason === 'Need new card without corrections' && 'Identity confirmation for reprint.'}
                  </div>
                </div>
              )}

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

      <div className="lg:col-span-5 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">My Submitted Applications</h2>
        {myApps.length === 0 ? (
          <p className="text-slate-500 text-sm">You have not submitted any forms yet.</p>
        ) : (
          <div className="space-y-3 max-h-screen overflow-y-auto pr-1">
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
                <p className="text-xs text-slate-600"><strong>Info:</strong> {app.formData?.ageOrDob}</p>
                <p className="text-xs text-slate-600"><strong>Address:</strong> {app.formData?.address}</p>
                <p className="text-xs text-slate-600"><strong>Details:</strong> {app.formData?.reasonOrCorrection}</p>
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
