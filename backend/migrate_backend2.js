const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

async function migrateBackend2() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  const columns = (await db.all("PRAGMA table_info(listings);")).map(c => c.name);

  const neededColumns = [
    { name: 'materialType', type: 'TEXT' },
    { name: 'category', type: 'TEXT' },
    { name: 'usageStatus', type: 'TEXT' },
    { name: 'locationCity', type: 'TEXT' },
    { name: 'description', type: 'TEXT' }
  ];

  for (const col of neededColumns) {
    if (!columns.includes(col.name)) {
      await db.run(`ALTER TABLE listings ADD COLUMN ${col.name} ${col.type};`);
      console.log(`✅ listings tablosuna '${col.name}' kolonu eklendi.`);
    }
  }

  console.log("\n🚀 Backend 2 Migration Tamamlandı.");
}

migrateBackend2();
