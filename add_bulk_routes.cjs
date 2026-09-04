const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');

const vehiclesTarget = `  app.delete("/api/admin/vehicles/:id", verifyAdmin, async (req, res) => {`;
const vehiclesBulk = `  app.post("/api/admin/vehicles/bulk-delete", verifyAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No IDs provided" });
      
      const adminUser = (req as any).user;
      
      // Delete dependencies for all ids
      await db.delete(trip_rates).where(sql\`vehicle_id IN (\${sql.join(ids, sql\`, \`)})\`);
      await db.update(bookings).set({ vehicleId: null }).where(sql\`vehicle_id IN (\${sql.join(ids, sql\`, \`)})\`);
      
      // Delete vehicles
      await db.delete(vehicles).where(sql\`id IN (\${sql.join(ids, sql\`, \`)})\`);
      
      // Audit log
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'BULK_DELETE_VEHICLES',
        module: 'vehicles',
        recordId: ids.join(','),
        changes: JSON.stringify({ action: 'bulk_deleted', count: ids.length }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("vehicles:");
      invalidateCacheTag("routes:");
      res.json({ success: true, count: ids.length });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Error deleting vehicles" });
    }
  });

  app.delete("/api/admin/vehicles/:id", verifyAdmin, async (req, res) => {`;

serverContent = serverContent.replace(vehiclesTarget, vehiclesBulk);

const bookingsTarget = `  app.delete("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {`;
const bookingsBulk = `  app.post("/api/admin/bookings/bulk-delete", verifyAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No IDs provided" });
      
      const adminUser = (req as any).user;
      
      await db.delete(bookings).where(sql\`id IN (\${sql.join(ids, sql\`, \`)})\`);
      
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'BULK_DELETE_BOOKINGS',
        module: 'bookings',
        recordId: ids.join(','),
        changes: JSON.stringify({ action: 'bulk_deleted', count: ids.length }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("bookings:");
      res.json({ success: true, count: ids.length });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: "Error deleting bookings" });
    }
  });

  app.delete("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {`;

serverContent = serverContent.replace(bookingsTarget, bookingsBulk);

fs.writeFileSync('server.ts', serverContent);
console.log("Added bulk routes successfully");
