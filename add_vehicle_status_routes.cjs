const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf8');

const targetFunction = `  app.post("/api/admin/vehicles/bulk-delete", verifyAdmin, async (req, res) => {`;
const replaceWith = `  app.put("/api/admin/vehicles/:id/status", verifyAdmin, async (req, res) => {
    try {
      const vehicleId = Number(req.params.id);
      const { status } = req.body;
      if (status !== 'active' && status !== 'inactive') return res.status(400).json({ error: "Invalid status" });
      
      const adminUser = (req as any).user;
      
      await db.update(vehicles).set({ status }).where(eq(vehicles.id, vehicleId));
      
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'UPDATE_VEHICLE_STATUS',
        module: 'vehicles',
        recordId: String(vehicleId),
        changes: JSON.stringify({ status }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("vehicles:");
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Error updating vehicle status" });
    }
  });

  app.post("/api/admin/vehicles/bulk-status", verifyAdmin, async (req, res) => {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No IDs provided" });
      if (status !== 'active' && status !== 'inactive') return res.status(400).json({ error: "Invalid status" });
      
      const adminUser = (req as any).user;
      
      await db.update(vehicles).set({ status }).where(inArray(vehicles.id, ids));
      
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'BULK_UPDATE_VEHICLE_STATUS',
        module: 'vehicles',
        recordId: ids.join(','),
        changes: JSON.stringify({ action: 'bulk_status_update', status, count: ids.length }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("vehicles:");
      res.json({ success: true, count: ids.length });
    } catch (error) {
      res.status(500).json({ error: "Error updating vehicles" });
    }
  });

  app.post("/api/admin/vehicles/bulk-delete", verifyAdmin, async (req, res) => {`;

serverContent = serverContent.replace(targetFunction, replaceWith);

fs.writeFileSync('server.ts', serverContent);
console.log("Added vehicle status API routes");
