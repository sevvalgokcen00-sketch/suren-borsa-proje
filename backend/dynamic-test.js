const { getDb } = require("./db");

(async () => {
  const db = await getDb();

  const listing = await db.run(`
    INSERT INTO listings
    (user_id, title, material_type, weight, price, city, status, is_archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    1,
    "Dinamik Dashboard Test Ýlaný",
    "Demir - Çelik",
    500,
    25,
    "Kocaeli",
    "Aktif",
    0
  ]);

  await db.run(`
    INSERT INTO offers
    (listing_id, buyer_id, offered_price_per_kg, status)
    VALUES (?, ?, ?, ?)
  `, [
    listing.lastID,
    1,
    24,
    "pending"
  ]);

  console.log("Test listingId:", listing.lastID);
  console.log("Test verileri eklendi.");
})();
