import { maskKey } from '../utils/maskHelper';

export default function MainLayout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              Election Commission of India (ECI)
            </h1>
            <p className="text-xs text-blue-200">
              Electoral Roll Revision & Verification System (Forms 6, 7, 8)
            </p>
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
                {user.staffKey && (
                  <p className="text-xs text-blue-200 font-mono">
                    Key: {maskKey(user.staffKey)}
                  </p>
                )}
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded font-semibold transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-6 flex-1">
        {children}
      </main>
    </div>
  );
}
