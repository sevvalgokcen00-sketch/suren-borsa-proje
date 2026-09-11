require("dotenv").config();
const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

(async () => {
  const c = await client.execute("SELECT COUNT(*) AS n FROM listings");
  console.log("İlan sayısı:", Number(c.rows[0].n));
  const b = await client.execute("SELECT title FROM listings LIMIT 2");
  console.log(
    "Başlıklar:",
    b.rows.map((r) => r.title),
  );
})();
