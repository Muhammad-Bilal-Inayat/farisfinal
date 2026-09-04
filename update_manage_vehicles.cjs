const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/ManageVehicles.tsx', 'utf8');

// 1. Add bulk status handlers
const bulkDeleteTarget = `  const confirmBulkDelete = async () => {`;
const bulkStatusMarkup = `
  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(\`/api/admin/vehicles/bulk-status\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\`
        },
        body: JSON.stringify({ ids: selectedIds, status })
      });
      if (res.ok) {
        showToast(isAr ? 'تم تحديث الحالة' : 'Status updated');
        fetchVehicles();
        setSelectedIds([]);
      } else {
        showToast(isAr ? 'فشل التحديث' : 'Update failed', 'error');
      }
    } catch (e) {
      showToast(isAr ? 'فشل التحديث' : 'Update failed', 'error');
    }
  };
  
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const res = await fetch(\`/api/admin/vehicles/\${id}/status\`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchVehicles();
        showToast(isAr ? 'تم تحديث الحالة' : 'Status updated');
      }
    } catch (e) {
      showToast(isAr ? 'فشل التحديث' : 'Update failed', 'error');
    }
  };
`;

if (!content.includes('handleBulkStatus')) {
  content = content.replace(bulkDeleteTarget, bulkStatusMarkup + bulkDeleteTarget);
}

// 2. Add Bulk Actions buttons next to "Delete Selected"
const headerButtonsTarget = `{selectedIds.length > 0 && (
            <button 
              onClick={() => setShowBulkDeleteModal(true)}`;
const headerButtonsReplacement = `{selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleBulkStatus('active')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle2 size={18} />
                <span className="hidden sm:inline">{isAr ? 'تنشيط' : 'Set Active'}</span>
              </button>
              <button 
                onClick={() => handleBulkStatus('inactive')}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <AlertCircle size={18} />
                <span className="hidden sm:inline">{isAr ? 'إيقاف' : 'Set Inactive'}</span>
              </button>
              <button 
                onClick={() => setShowBulkDeleteModal(true)}`;

if (!content.includes('Set Active')) {
  content = content.replace(headerButtonsTarget, headerButtonsReplacement);
}

// Fix ending div for buttons
if (content.includes(headerButtonsReplacement)) {
  content = content.replace(
    `<span className="hidden sm:inline">
                {isAr ? \`حذف المحددة (\${selectedIds.length})\` : \`Delete Selected (\${selectedIds.length})\`}
              </span>
            </button>
          )}
          <button`,
    `<span className="hidden sm:inline">
                {isAr ? \`حذف المحددة (\${selectedIds.length})\` : \`Delete Selected (\${selectedIds.length})\`}
              </span>
            </button>
            </div>
          )}
          <button`
  );
}

// 3. Add toggle status in table view
const tableStatusTarget = `<span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-saudi-green)]/10 text-[var(--color-saudi-green)] border border-[var(--color-saudi-green)]/20">
                        {isAr ? 'مفعل' : 'Active'}
                      </span>`;
const tableStatusReplacement = `<button 
                        onClick={() => handleToggleStatus(v.id, v.status || 'active')}
                        className={\`px-3 py-1 rounded-full text-xs font-bold border transition-colors \${
                          (v.status || 'active') === 'active' 
                            ? 'bg-[var(--color-saudi-green)]/10 text-[var(--color-saudi-green)] border-[var(--color-saudi-green)]/20 hover:bg-[var(--color-saudi-green)]/20' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }\`}
                      >
                        {(v.status || 'active') === 'active' 
                          ? (isAr ? 'مفعل' : 'Active') 
                          : (isAr ? 'غير مفعل' : 'Inactive')}
                      </button>`;
if (!content.includes('handleToggleStatus(v.id')) {
  content = content.replace(tableStatusTarget, tableStatusReplacement);
}

// 4. Add toggle status in Grid view
const gridStatusTarget = `<div className="absolute top-4 right-4 bg-[var(--color-saudi-green)]/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <CheckCircle2 size={12} />
                {isAr ? 'متاح' : 'Active'}
              </div>`;
const gridStatusReplacement = `<button 
                onClick={(e) => { e.preventDefault(); handleToggleStatus(v.id, v.status || 'active'); }}
                className={\`absolute top-4 right-4 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition-colors \${
                  (v.status || 'active') === 'active' 
                    ? 'bg-[var(--color-saudi-green)]/90 hover:bg-[var(--color-saudi-green)]' 
                    : 'bg-slate-600/90 hover:bg-slate-700'
                }\`}
              >
                {(v.status || 'active') === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {(v.status || 'active') === 'active' ? (isAr ? 'مفعل' : 'Active') : (isAr ? 'غير مفعل' : 'Inactive')}
              </button>`;
if (content.includes('متاح')) {
  content = content.replace(gridStatusTarget, gridStatusReplacement);
}

fs.writeFileSync('src/pages/admin/ManageVehicles.tsx', content);
console.log("Updated ManageVehicles.tsx with status toggles");
