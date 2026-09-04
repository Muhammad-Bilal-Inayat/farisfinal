const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/BookingsAdmin.tsx', 'utf8');

// The issue is that selectedIds is being used but not declared because the regex replaced it or didn't add it.
if (!content.includes('const [selectedIds, setSelectedIds]')) {
  const target = `const [assigningDriverId, setAssigningDriverId] = useState<string>('');`;
  const replacement = `const [assigningDriverId, setAssigningDriverId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);`;
  
  content = content.replace(target, replacement);
  fs.writeFileSync('src/pages/admin/BookingsAdmin.tsx', content);
  console.log("Added selectedIds state");
}
