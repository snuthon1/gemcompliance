const { createClient } = require('@libsql/client');
const path = require('path');

const localClient = createClient({
  url: `file:${path.join(__dirname, 'prisma/dev.db')}`
});

const tursoClient = createClient({
  url: 'libsql://gem-compliance-snuthon1.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg1ODMzMDEsImlkIjoiMDFhMDZmZGYtM2EwMS03YTlhLWJiMTEtM2Q2ODUzYWYyN2FmIiwia2lkIjoiMlAwTW1RdEJGR1lkaW12T3Z5MmZDSXFsXzJQd2pHdlhadDlHTGR0VkhyUSIsInJpZCI6ImMwZmJiNjI4LThiOWItNGIwYi1iMTI4LTAzZjg3ZWViYzU5ZSJ9.WTxUfsWx46akNAwVpYAOrkZDVcZ_8thIRy0BnpYtAgOLrsH8gSrDnGgGdIbVpYkggH_6x4GzLsLWoO1T5IOOBA'
});

async function migrate() {
  console.log('=== MIGRATING DEV.DB TO TURSO CLOUD DATABASE ===\n');

  // 1. Get all table schemas
  const tablesRes = await localClient.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'");
  console.log(`Found ${tablesRes.rows.length} tables in local SQLite.`);

  for (const row of tablesRes.rows) {
    const tableName = row.name;
    const tableSql = row.sql;
    console.log(`Creating table "${tableName}" on Turso...`);
    await tursoClient.execute(`DROP TABLE IF EXISTS "${tableName}"`);
    await tursoClient.execute(tableSql);

    // 2. Fetch all data rows
    const dataRes = await localClient.execute(`SELECT * FROM "${tableName}"`);
    console.log(`  Copying ${dataRes.rows.length} rows to "${tableName}" on Turso...`);

    if (dataRes.rows.length > 0) {
      const columns = Object.keys(dataRes.rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const colNames = columns.map(c => `"${c}"`).join(', ');
      const insertSql = `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders})`;

      for (const r of dataRes.rows) {
        const values = columns.map(c => r[c]);
        await tursoClient.execute({ sql: insertSql, args: values });
      }
    }
  }

  console.log('\n=== VERIFYING TURSO DATABASE TABLES & COUNTS ===');
  for (const row of tablesRes.rows) {
    const countRes = await tursoClient.execute(`SELECT COUNT(*) as total FROM "${row.name}"`);
    console.log(`Table "${row.name}": ${countRes.rows[0].total} rows on Turso!`);
  }
}

migrate().then(() => console.log('\nSUCCESSFULLY MIGRATED TO TURSO!')).catch(e => console.error(e));