const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/ManageVehicles.tsx', 'utf8');

// 1. Add states
const stateTarget = `  const [showGallery, setShowGallery] = useState(false);`;
const stateReplacement = `  const [showGallery, setShowGallery] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<any | null>(null);`;
content = content.replace(stateTarget, stateReplacement);

// 2. Replace handleDelete
const targetFunction = `  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من رغبتك في حذف هذه السيارة من الأسطول بشكل نهائي؟" : "Are you sure you want to permanently delete this vehicle from the active fleet?")) return;
    try {
      const res = await fetch(\`/api/admin/vehicles/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` }
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }
      if (res.ok) {
        showToast(isAr ? 'تم حذف السيارة من الأسطول' : 'Vehicle deleted from active fleet');
        fetchVehicles();
        notifyVehicleUpdated();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete failed:", errorData);
        showToast(isAr ? 'فشل حذف السيارة' : (errorData.error || 'Failed to delete vehicle'), 'error');
      }
    } catch (e) {
      showToast(isAr ? 'فشل حذف السيارة' : 'Failed to delete vehicle', 'error');
    }
  };`;

const replaceWithFunction = `  const requestDelete = (v: any) => {
    setVehicleToDelete(v);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    const id = vehicleToDelete.id;
    setIsDeletingId(id);
    try {
      const res = await fetch(\`/api/admin/vehicles/\${id}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('adminToken')}\` }
      });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }
      if (res.ok) {
        showToast(isAr ? 'تم حذف السيارة من الأسطول' : 'Vehicle deleted from active fleet');
        fetchVehicles();
        notifyVehicleUpdated();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Delete failed:", errorData);
        showToast(isAr ? 'فشل حذف السيارة' : (errorData.error || 'Failed to delete vehicle'), 'error');
      }
    } catch (e) {
      showToast(isAr ? 'فشل حذف السيارة' : 'Failed to delete vehicle', 'error');
    } finally {
      setIsDeletingId(null);
      setVehicleToDelete(null);
    }
  };`;
content = content.replace(targetFunction, replaceWithFunction);

// 3. Update Grid View Button
content = content.replace(
  `onClick={() => handleDelete(v.id)}`,
  `onClick={() => requestDelete(v)} disabled={isDeletingId === v.id}`
);
content = content.replace(
  `onClick={() => handleDelete(v.id)}`, // replace the table view one too, might need a generic replace all
  `onClick={() => requestDelete(v)} disabled={isDeletingId === v.id}`
);

// We need to carefully replace the Trash2 icon inside the delete buttons.
// Grid View:
content = content.replace(
  `onClick={() => requestDelete(v)} disabled={isDeletingId === v.id} \n                      title={isAr ? 'حذف من الأسطول' : 'Delete Vehicle'}\n                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"\n                    >\n                      <Trash2 size={16} />`,
  `onClick={() => requestDelete(v)} disabled={isDeletingId === v.id} \n                      title={isAr ? 'حذف من الأسطول' : 'Delete Vehicle'}\n                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"\n                    >\n                      {isDeletingId === v.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}`
);

// Table View:
content = content.replace(
  `onClick={() => requestDelete(v)} disabled={isDeletingId === v.id}\n                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"\n                        >\n                          <Trash2 size={15} />`,
  `onClick={() => requestDelete(v)} disabled={isDeletingId === v.id}\n                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"\n                          title={isAr ? 'حذف من الأسطول' : 'Delete Vehicle'}\n                        >\n                          {isDeletingId === v.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}`
);

// 4. Add the Delete Modal UI
const modalUI = `
      {/* CONFIRM DELETE MODAL */}
      {vehicleToDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isAr ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              {isAr 
                ? \`هل أنت متأكد من رغبتك في حذف "\${vehicleToDelete.name}" بشكل نهائي؟ هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع الأسعار المرتبطة بها.\`
                : \`Are you sure you want to permanently delete "\${vehicleToDelete.name}"? This action cannot be undone and will remove all associated trip rates.\`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setVehicleToDelete(null)}
                disabled={isDeletingId !== null}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeletingId !== null}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {isDeletingId !== null ? (
                  <><RefreshCw size={16} className="animate-spin" /> {isAr ? 'جاري الحذف...' : 'Deleting...'}</>
                ) : (
                  <><Trash2 size={16} /> {isAr ? 'نعم، احذف' : 'Yes, Delete'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/\{isEditing && \(/g, modalUI + '\n      {isEditing && (');

fs.writeFileSync('src/pages/admin/ManageVehicles.tsx', content);
console.log("ManageVehicles.tsx updated");
