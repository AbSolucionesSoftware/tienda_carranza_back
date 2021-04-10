const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');
const { 
    subirImagen,
    crearCarousel,
    obtenerCarousel,
    actualizarCarousel, 
    eliminarCarousel,
    obtenerTodosCarousels,
    obtenerLimiteCarousels
} = require('../controllers/carousel.controllers');

router.route('/')
    .get(obtenerTodosCarousels)

router.route('/limite')
    .get(obtenerLimiteCarousels)

router.route('/nuevo/')
    .post(auth,subirImagen, crearCarousel)

router.route('/:idCourrucel')
    .get(obtenerCarousel)
    .put(auth,subirImagen, actualizarCarousel)
    .delete(auth,eliminarCarousel)


module.exports = router;