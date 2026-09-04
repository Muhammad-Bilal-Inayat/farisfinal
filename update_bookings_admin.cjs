const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/BookingsAdmin.tsx', 'utf8');

const bulkDeleteTarget = `  const confirmBulkDelete = async () => {`;
const bulkStatusMarkup = `
  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(\`/api/admin/bookings/bulk-status\`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\`
        },
        body: JSON.stringify({ ids: selectedIds, status })
      });
      if (res.ok) {
        showToast(isAr ? 'تم تحديث حالة الحجوزات' : 'Bookings status updated');
        fetchBookings();
        setSelectedIds([]);
      } else {
        showToast(isAr ? 'فشل التحديث' : 'Update failed', 'error');
      }
    } catch (e) {
      showToast(isAr ? 'فشل التحديث' : 'Update failed', 'error');
    }
  };
`;

if (!content.includes('handleBulkStatus')) {
  content = content.replace(bulkDeleteTarget, bulkStatusMarkup + bulkDeleteTarget);
}

const headerButtonsTarget = `{selectedIds.length > 0 && (
            <button 
              onClick={() => setShowBulkDeleteModal(true)}`;
const headerButtonsReplacement = `{selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatus(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="bg-white border border-slate-300 text-slate-700 px-3 py-2.5 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{isAr ? 'تغيير الحالة...' : 'Change Status...'}</option>
                <option value="Confirmed">{isAr ? 'مؤكد' : 'Confirmed'}</option>
                <option value="Completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                <option value="Pending">{isAr ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="Cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
              </select>
              <button 
                onClick={() => setShowBulkDeleteModal(true)}`;

if (!content.includes('Change Status...')) {
  content = content.replace(headerButtonsTarget, headerButtonsReplacement);
}

// Fix ending div for buttons
if (content.includes(headerButtonsReplacement)) {
  content = content.replace(
    `<span className="hidden sm:inline">
                {isAr ? \`حذف المحدد (\${selectedIds.length})\` : \`Delete Selected (\${selectedIds.length})\`}
              </span>
            </button>
          )}
          <button`,
    `<span className="hidden sm:inline">
                {isAr ? \`حذف المحدد (\${selectedIds.length})\` : \`Delete Selected (\${selectedIds.length})\`}
              </span>
            </button>
            </div>
          )}
          <button`
  );
}

fs.writeFileSync('src/pages/admin/BookingsAdmin.tsx', content);
console.log("Updated BookingsAdmin.tsx with bulk status actions");
