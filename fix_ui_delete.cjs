const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/ManageVehicles.tsx', 'utf8');

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
      }
    } catch (e) {
      showToast(isAr ? 'فشل حذف السيارة' : 'Failed to delete vehicle', 'error');
    }
  };`;

const replaceWith = `  const handleDelete = async (id: number) => {
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

content = content.replace(targetFunction, replaceWith);

fs.writeFileSync('src/pages/admin/ManageVehicles.tsx', content);
console.log("Updated ManageVehicles.tsx successfully");
