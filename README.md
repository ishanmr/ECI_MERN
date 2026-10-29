# ECI Election Portal

A React and Express portal for citizen voter applications, Booth Level Officer field verification, and Electoral Registration Officer review. MongoDB stores users, invitation keys, applications, and audit records.

## Requirements

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Start the portal

1. Copy `backend/.env.example` to `backend/.env`. Set `MONGODB_URI` and replace `JWT_SECRET` with a random secret of at least 32 characters. Leave `ERO_MASTER_KEY` blank to have the backend generate a 16-character alphanumeric key on first start.
2. Install dependencies from the project folder:

   ```sh
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Start the API and frontend with `npm run dev`.
4. Open `http://localhost:5173`. The API listens on `http://localhost:5000`.

The first generated ERO key is printed by the backend once. Use it to register an ERO account in the Staff Portal. The ERO can create single-use BLO registration keys. Staff use their registration key at login as well. Do not commit `backend/.env`.

## Workflows

- **Citizen:** Register and submit Form 6, Form 7, or Form 8; view submitted applications and their BLO verification status.
- **BLO:** View citizen applications, record house visits and document checks, and review the shared audit trail.
- **ERO:** Generate BLO invitation keys, inspect an officer's work by key, view applications, and review audit history.

The API restricts routes by JWT role. Passwords are hashed with bcrypt, protected routes require a Bearer token, and important actions are written to the audit log. Use this portal with non-production data until identity checks, privacy protections, and deployment controls are connected.
