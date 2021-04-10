const { Router } = require('express');
const router = Router();
const auth = require('../middleware/auth');

const { 
    agregarApartado,
    obtenerApartado, 
    actualizarApartado, 
    obtenerApartados,
    eliminarApartado,
    obtenerUnApartado,
    filtroApartadosCliente,
    obtenerApartadosCliente,
    eliminarApartadoCambiarEstado,
    createApartadoMultiple
} = require('../controllers/apartado.controllers');


router.route('/multiple/').post(createApartadoMultiple);

router.route('/')
    .get(auth,obtenerApartados)

router.route('/filtroCliente/:filter')
    .get(auth,filtroApartadosCliente)

router.route('/nuevo/:idCliente')
    .post(auth,agregarApartado)

router.route('/cliente/apartados/:idCliente')
    .get(auth,obtenerApartadosCliente)
    
router.route('/:idApartado')
    .get(auth,obtenerApartado)
    .put(actualizarApartado)
    .delete(auth,eliminarApartado)

router.route('/traer/:id').get(auth,obtenerUnApartado)
    
router.route('/estado/eliminado/:idApartado').put(eliminarApartadoCambiarEstado)

module.exports = router;