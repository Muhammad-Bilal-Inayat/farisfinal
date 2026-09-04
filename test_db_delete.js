const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const schema = require('./dist/server.cjs').schema; // This might not work, let's just write an ES module script.
