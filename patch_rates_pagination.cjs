const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/RatesAdmin.tsx', 'utf8');

if (!content.includes('const [page, setPage]')) {
  // Add pagination state
  content = content.replace(
    "const [toast, setToast] = useState<string | null>(null);",
    "const [toast, setToast] = useState<string | null>(null);\n  const [page, setPage] = useState(1);\n  const limit = 20;"
  );

  // Apply pagination
  const filterTarget = `    if (selectedVehicleFilter !== 'all' && String(r.vehicleId) !== selectedVehicleFilter) return false;
    return true;
  });`;
  
  const filterReplacement = `    if (selectedVehicleFilter !== 'all' && String(r.vehicleId) !== selectedVehicleFilter) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);`;

  content = content.replace(filterTarget, filterReplacement);

  // Replace filtered.map with paginated.map
  content = content.replace(/filtered\.map\(/g, 'paginated.map(');

  // Search input change needs to reset page
  content = content.replace(
    "onChange={e => setSearch(e.target.value)}",
    "onChange={e => { setSearch(e.target.value); setPage(1); }}"
  );

  // Vehicle filter needs to reset page
  content = content.replace(
    "onClick={() => setSelectedVehicleFilter('all')}",
    "onClick={() => { setSelectedVehicleFilter('all'); setPage(1); }}"
  );
  content = content.replace(
    "onClick={() => setSelectedVehicleFilter(String(v.id))}",
    "onClick={() => { setSelectedVehicleFilter(String(v.id)); setPage(1); }}"
  );

  // Add pagination UI
  const targetEnd = `      {/* Edit Modal */}`;
  const paginationUI = `
      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600">
            {isAr ? \`الصفحة \${page} من \${totalPages}\` : \`Page \${page} of \${totalPages}\`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAr ? 'السابق' : 'Previous'}
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAr ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}`;
      
  content = content.replace(targetEnd, paginationUI);
  
  fs.writeFileSync('src/pages/admin/RatesAdmin.tsx', content);
  console.log('RatesAdmin patched');
}
