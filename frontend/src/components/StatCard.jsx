export default function StatCard({ title, value, borderColor = 'border-blue-600' }) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow border-t-4 ${borderColor}`}>
      <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}
