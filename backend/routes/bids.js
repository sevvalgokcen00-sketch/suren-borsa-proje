const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

// 1. TÜM TEKLİFLERİ LİSTELEME (GET /api/bids)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, type, listingId } = req.query;

    let query = `
      SELECT b.*,
             l.title as listingTitle,
             l.status as listingStatus,
             b.status as status
      FROM bids b
      LEFT JOIN listings l ON b.listingId = l.id
      WHERE 1=1
    `;
    const params = [];

    if (listingId) {
      query += ' AND b.listingId = ?';
      params.push(Number(listingId));
    }

    if (type === 'incoming') {
      // Satıcıya gelen teklifler (İlanın sahibi userId ise)
      query += ' AND l.user_id = ?';
      params.push(Number(userId));
    } else if (type === 'outgoing') {
      // Benim verdiğim teklifler
      query += ' AND b.buyerId = ?';
      params.push(Number(userId));
    }

    query += ' ORDER BY b.createdAt DESC';

    const rawBids = await db.all(query, params);
    const bids = rawBids.map(b => ({
      ...b,
      listingTitle: b.listingTitle ? b.listingTitle.replace(/�/g, "ı").replace(/Tests*lan/g, "Test İlanı") : "Dinamik Dashboard Test İlanı"
    }));
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(bids);
  } catch (error) {
    console.error('Bids GET Hatası:', error);
    res.status(500).json({ message: 'Teklifler çekilirken hata oluştu!', error: error.message });
  }
});

// 2. TEK BİR TEKLİF DETAYI (GET /api/bids/:id)
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const bid = await db.get('SELECT * FROM bids WHERE id = ?', [id]);
    if (!bid) {
      return res.status(404).json({ message: 'Teklif bulunamadı!' });
    }
    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Teklif detayı alınamadı!', error: error.message });
  }
});

// 3. YENİ TEKLİF VERME (POST /api/bids)
router.post('/', async (req, res) => {
  try {
    const db = await getDb();
    const {
      listingId,
      buyerId,
      buyerCompanyName,
      amount,
      unit = 'kg',
      price,
      incoterm,
      paymentType,
      buyerNote,
      expiresIn,
      hasCertificate
    } = req.body;

    if (!listingId || !price || !amount) {
      return res.status(400).json({ message: 'İlan ID, miktar ve fiyat zorunludur!' });
    }

    const totalPrice = Number(price) * Number(amount);

    const result = await db.run(`
      INSERT INTO bids (
        listingId, buyerId, buyerCompanyName, amount, unit,
        price, totalPrice, incoterm, paymentType, buyerNote,
        expiresIn, status, hasCertificate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'bekleyen', ?)
    `, [
      listingId,
      buyerId || 1,
      buyerCompanyName || 'Demir Çelik A.Ş.',
      amount,
      unit,
      price,
      totalPrice,
      incoterm || 'FOB',
      paymentType || 'Peşin',
      buyerNote || '',
      expiresIn || '24 Saat',
      hasCertificate ? 1 : 0
    ]);

    const newBid = await db.get('SELECT * FROM bids WHERE id = ?', [result.lastID]);
    res.status(201).json(newBid);
  } catch (error) {
    console.error('Bids POST Hatası:', error);
    res.status(500).json({ message: 'Teklif oluşturulurken hata oluştu!', error: error.message });
  }
});

// 4. TEKLİF DURUMU GÜNCELLEME (PATCH /api/bids/:id/status)
router.patch('/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { status } = req.body;

    await db.run('UPDATE bids SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.get('SELECT * FROM bids WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Teklif güncellenemedi!', error: error.message });
  }
});


// 5. TEKLİF SİL (DELETE /api/bids/:id)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    await db.run('DELETE FROM bids WHERE id = ?', [id]);
    res.json({ success: true, message: 'Teklif başarıyla silindi', deletedId: id });
  } catch (error) {
    console.error('Teklif silinemedi:', error);
    res.status(500).json({ message: 'Teklif silinemedi!', error: error.message });
  }
});

module.exports = router;
