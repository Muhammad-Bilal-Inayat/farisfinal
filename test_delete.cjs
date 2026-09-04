const fs = require('fs');

let serverContent = fs.readFileSync('server.ts', 'utf8');

const targetFunction = `  app.delete("/api/admin/vehicles/:id", verifyAdmin, async (req, res) => {
    try {
      const vehicleId = Number(req.params.id);
      
      // Before hard deleting the vehicle, we must remove/nullify any foreign key references
      // 1. Delete associated trip rates
      await db.delete(trip_rates).where(eq(trip_rates.vehicleId, vehicleId));
      
      // 2. Set vehicleId to null in any existing bookings to preserve the booking history
      await db.update(bookings).set({ vehicleId: null }).where(eq(bookings.vehicleId, vehicleId));

      // Hard delete as requested by the user
      await db.delete(vehicles).where(eq(vehicles.id, vehicleId));

      // Record audit log
      const adminUser = (req as any).user;
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'DELETE_VEHICLE',
        module: 'vehicles',
        recordId: String(vehicleId),
        changes: JSON.stringify({ action: 'deleted' }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("vehicles:");
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error archiving vehicle" }); }
  });`;

const replaceWith = `  app.delete("/api/admin/vehicles/:id", verifyAdmin, async (req, res) => {
    try {
      const vehicleId = Number(req.params.id);
      
      // Before hard deleting the vehicle, we must remove/nullify any foreign key references
      // 1. Delete associated trip rates
      await db.delete(trip_rates).where(eq(trip_rates.vehicleId, vehicleId));
      
      // 2. Set vehicleId to null in any existing bookings to preserve the booking history
      await db.update(bookings).set({ vehicleId: null }).where(eq(bookings.vehicleId, vehicleId));

      // Hard delete as requested by the user
      await db.delete(vehicles).where(eq(vehicles.id, vehicleId));

      // Record audit log
      const adminUser = (req as any).user;
      await db.insert(admin_audit_logs).values({
        userId: adminUser?.id || null,
        username: adminUser?.username || 'admin',
        action: 'DELETE_VEHICLE',
        module: 'vehicles',
        recordId: String(vehicleId),
        changes: JSON.stringify({ action: 'deleted' }),
        ipAddress: req.ip || String(req.headers['x-forwarded-for'] || ''),
        createdAt: new Date().toISOString()
      });

      invalidateCacheTag("vehicles:");
      invalidateCacheTag("routes:");
      res.json({ success: true });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({ error: "Error deleting vehicle: " + (error.message || String(error)) }); 
    }
  });`;

serverContent = serverContent.replace(targetFunction, replaceWith);

fs.writeFileSync('server.ts', serverContent);
console.log("Updated server.ts successfully");
