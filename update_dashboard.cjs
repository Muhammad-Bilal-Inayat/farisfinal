const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/DashboardHome.tsx', 'utf8');

// Add audit logs state
if (!content.includes('const [auditLogs')) {
  content = content.replace(
    `const [messages, setMessages] = useState<any[]>([]);`,
    `const [messages, setMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);`
  );
}

// Add fetch for audit logs
if (!content.includes("fetch('/api/admin/audit_logs'")) {
  content = content.replace(
    `const [bRes, vRes, mRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/vehicles', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/messages', { headers: { 'Authorization': \`Bearer \${token}\` } })
      ]);`,
    `const [bRes, vRes, mRes, aRes] = await Promise.all([
        fetch('/api/admin/bookings', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/vehicles', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/messages', { headers: { 'Authorization': \`Bearer \${token}\` } }),
        fetch('/api/admin/audit_logs', { headers: { 'Authorization': \`Bearer \${token}\` } })
      ]);
      if (aRes?.ok) { setAuditLogs(await aRes.json()); }`
  );
}

// Add ComposedChart for Bookings vs Vehicles (replace the first chart or add beside it)
if (!content.includes('ComposedChart')) {
  content = content.replace(
    `import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell`,
    `import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area`
  );
}

// Create the data for Bookings vs Vehicles
const bookingsChartDataScript = `
  const bookingsByDate: Record<string, number> = {};
  filteredBookings.forEach(b => {
    if (b.createdAt || b.date) {
      const d = new Date(b.createdAt || b.date);
      const key = \`\${d.getDate()} \${d.toLocaleString('en-US', { month: 'short' })}\`;
      bookingsByDate[key] = (bookingsByDate[key] || 0) + 1;
    }
  });
  const bookingsVsVehiclesData = Object.entries(bookingsByDate).map(([date, count]) => ({
    name: date,
    Bookings: count,
    Vehicles: activeVehiclesCount
  })).slice(-15); // last 15 active days
`;
if (!content.includes('bookingsVsVehiclesData')) {
  content = content.replace(`// Chart: Monthly / Recent Revenue`, bookingsChartDataScript + `\n  // Chart: Monthly / Recent Revenue`);
}

// Replace the existing BarChart with ComposedChart (or just add it)
const composedChartMarkup = `
        {/* Bookings vs Vehicles Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                {isAr ? 'حجوزات الشهر مقابل توفر السيارات' : 'Bookings vs Vehicle Availability'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'نظرة عامة على الطلب وتوفر الأسطول' : 'Demand vs fleet capacity overview'}
              </p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bookingsVsVehiclesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar yAxisId="left" dataKey="Bookings" fill="var(--color-saudi-emerald)" radius={[4, 4, 0, 0]} barSize={32} />
                <Line yAxisId="right" type="monotone" dataKey="Vehicles" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
`;

content = content.replace(`{/* Charts Section */}`, `{/* Charts Section */}\n` + composedChartMarkup);

const activityLogMarkup = `
      {/* Admin Activity Log */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[var(--color-saudi-emerald)]" />
              {isAr ? 'سجل نشاط الإدارة' : 'Admin Activity Log'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'أحدث الإجراءات المتخذة في النظام للمساءلة' : 'Recent actions taken in the system for accountability'}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-4">{isAr ? 'الوقت' : 'Timestamp'}</th>
                <th className="p-4">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="p-4">{isAr ? 'الإجراء' : 'Action'}</th>
                <th className="p-4">{isAr ? 'الوحدة' : 'Module'}</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm divide-y divide-slate-100 text-slate-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    {isAr ? 'لا توجد سجلات' : 'No activity logs found.'}
                  </td>
                </tr>
              ) : (
                auditLogs.slice(0, 5).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {log.username || 'Admin'}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                      <div className="text-[10px] text-slate-400 max-w-xs truncate">{log.changes}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">
                        {log.module}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
`;

content = content.replace(`{/* Recent Bookings Mini Table */}`, activityLogMarkup + `\n      {/* Recent Bookings Mini Table */}`);

fs.writeFileSync('src/pages/admin/DashboardHome.tsx', content);
console.log("Updated DashboardHome.tsx with Chart and Activity Log");
