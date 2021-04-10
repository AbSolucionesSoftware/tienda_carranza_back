const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');

const { homaQuerysShop } = require('../controllers/home');

router.route('/:idUser').get(homaQuerysShop);

module.exports = router;