const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');

const { 
    crearSugerencia,
    obtenerSugerencia,
    actualizarSugerencia, 
    eliminarSugerencia
} = require('../controllers/sugerencia.controllers');

router.route('/nueva/:idProducto')
    .post(crearSugerencia)

router.route('/:idProducto')
    .get(obtenerSugerencia)
    .put(auth,actualizarSugerencia)
    .delete(auth,eliminarSugerencia)


module.exports = router;