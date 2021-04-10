const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth')

const { createPago, obtenerPagosCliente,createPagoMovil } = require('../controllers/pagos.controllers')

router.route('/').post(auth,createPago);

router.route('/:idCliente').get(auth,obtenerPagosCliente);

router.route('/movil/').post(auth,createPagoMovil)

module.exports = router;