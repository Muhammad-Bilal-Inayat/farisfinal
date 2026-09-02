const { db } = require('./src/db/index.js');
const { vehicles } = require('./src/db/schema.js');
async function test() {
  const v = await db.select().from(vehicles);
  console.log(v.map(x => x.name));
}
test();
