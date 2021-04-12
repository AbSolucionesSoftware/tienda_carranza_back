const { Router } = require('express');
const router = Router();

const { 
    crearTienda,
    obtenerTienda,
    actualizarTienda,
    eliminarTienda,
    subirImagen,
    politicasEmpresa,
    cambiarColoresTienda
} = require('../controllers/tienda.controllers');
const auth = require('../middleware/auth');

router.route('/')
    .post(auth,subirImagen,crearTienda)
    .get(obtenerTienda)

router.route('/politicas/:idTienda').put(auth,politicasEmpresa);

router.route('/:idTienda')
    .put(auth,subirImagen,actualizarTienda)
    .delete(auth,eliminarTienda)

router.route('/editar/colors/:idTienda').put(auth,cambiarColoresTienda);

module.exports = router;