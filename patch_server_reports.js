const fs = require("fs");
const file = "backend/server.js";
let code = fs.readFileSync(file, "utf8");

if (!code.includes("reportsRouter") && !code.includes("/api/reports")) {
  code = code.replace(
    /const (.*?)Router = require\(.*?\);/g,
    (match) => `${match}\nconst reportsRouter = require('./routes/reports');`
  );
  code = code.replace(
    /app\.use\('\/api\/listings', listingsRouter\);/,
    `app.use('/api/listings', listingsRouter);\napp.use('/api/reports', reportsRouter);`
  );
  fs.writeFileSync(file, code, "utf8");
  console.log("server.js: /api/reports rotası eklendi!");
} else {
  console.log("server.js: /api/reports zaten mevcut.");
}
