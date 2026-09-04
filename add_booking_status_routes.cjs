const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf8');

const targetFunction = `  app.post("/api/admin/bookings/bulk-delete", verifyAdmin, async (req, res) => {`;
const replaceWith = `  app.post("/api/admin/bookings/bulk-status", verifyAdmin, async (req, res) => {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No IDs provided" });
      
      const adminUser = (req as any).user;
      
      await db.update(bookings).set({ status }).where(inArray(bookings.id, ids));
      
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'BULK_UPDATE_BOOKING_STATUS',
        module: 'bookings',
        recordId: ids.join(','),
        changes: JSON.stringify({ action: 'bulk_status_update', status, count: ids.length }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("bookings:");
      res.json({ success: true, count: ids.length });
    } catch (error) {
      console.error("Bulk status error:", error);
      res.status(500).json({ error: "Error updating bookings" });
    }
  });

  app.post("/api/admin/bookings/bulk-delete", verifyAdmin, async (req, res) => {`;

if(!serverContent.includes('/api/admin/bookings/bulk-status')) {
  serverContent = serverContent.replace(targetFunction, replaceWith);
  fs.writeFileSync('server.ts', serverContent);
  console.log("Added booking bulk status API routes");
}
