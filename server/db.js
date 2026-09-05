const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma;

if (url && authToken) {
  console.log(`[DATABASE] Connecting via Prisma LibSQL Adapter to Turso: ${url}`);
  const libsql = createClient({ url, authToken });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  console.log(`[DATABASE] Connecting to local SQLite file: prisma/dev.db`);
  prisma = new PrismaClient();
}

module.exports = prisma;