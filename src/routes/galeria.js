const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth')
const { 
    crearGaleria,
    obtenerGaleria,
    crearImagen, 
    actualizarImagen, 
    eliminarGaleria, 
    eliminarImagen, 
    subirImagen 
} = require('../controllers/galeria.controllers');

router.route('/nueva/:idProducto')
    .post(auth, subirImagen, crearGaleria, crearImagen);

router.route('/:idProducto')
    .get(obtenerGaleria)
    .delete(eliminarGaleria)

router.route('/:idProducto/imagen/:idImagen')
    .put(auth,subirImagen, actualizarImagen)
    .delete(auth,eliminarImagen)


module.exports = router;