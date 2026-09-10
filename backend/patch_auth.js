const fs = require('fs');

let code = fs.readFileSync('controllers/authController.js', 'utf8');

// Eski destructuring satırını esnek hale getir
const oldLine = "const { name, email, password, company_name } = req.body;";
const newLine = `const { name, fullName, email, password, company_name, companyName } = req.body;
  const userName = name || fullName;
  const compName = company_name || companyName;`;

code = code.replace(oldLine, newLine);

// Kontrollerdeki name değişkenlerini userName ile değiştir
code = code.replace("if (!name || !email || !password)", "if (!userName || !email || !password)");
code = code.replace("[name, email, hashedPass", "[userName, email, hashedPass");
code = code.replace("company_name || null", "compName || null");

fs.writeFileSync('controllers/authController.js', code, 'utf8');
console.log("✅ authController hem fullName hem name alanlarını destekleyecek şekilde güncellendi.");
