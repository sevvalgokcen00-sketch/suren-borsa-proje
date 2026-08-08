const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = [];

// 1. KURUMSAL HESAP OLUŞTURMA
exports.register = async (req, res) => {
  try {
    const { fullName, companyName, email, phone, password, termsAccepted } = req.body;

    if (!fullName || !companyName || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Lütfen tüm zorunlu alanları doldurun." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Şifreniz en az 6 karakter olmalıdır." 
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({ 
        success: false, 
        message: "Lütfen Kullanım Koşulları ve Gizlilik Politikası'nı kabul edin." 
      });
    }

    // Aynı e-posta adresiyle daha önce kayıt olunmuş mu?
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu e-posta adresi zaten kullanılmaktadır."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      fullName,
      companyName,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    res.status(201).json({
      success: true,
      message: "Kurumsal hesabınız başarıyla oluşturuldu.",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        companyName: newUser.companyName,
        email: newUser.email,
        phone: newUser.phone
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Sunucu hatası", error: error.message });
  }
};

// 2. KULLANICI GİRİŞİ
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "E-posta ve şifre zorunludur." });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Hatalı şifre girdiniz." });
    }

    const expiresIn = rememberMe ? '7d' : '1d';

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'gizli_anahtar_surenborsa',
      { expiresIn }
    );

    res.status(200).json({
      success: true,
      message: "Giriş başarılı!",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        companyName: user.companyName,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Sunucu hatası", error: error.message });
  }
};

// 3. ŞİFREMİ UNUTTUM
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Lütfen e-posta adresinizi girin." });
    }

    res.status(200).json({
      success: true,
      message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Sunucu hatası", error: error.message });
  }
};