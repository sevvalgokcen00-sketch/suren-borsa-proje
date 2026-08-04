const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/categories', homeController.getCategories);
router.get('/featured', homeController.getFeaturedListings);
router.get('/search', homeController.searchListings);

module.exports = router;