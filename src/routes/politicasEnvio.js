const { Router } = require('express');
const router = Router();
const { getPoliticas,createPoliticas,updatePoliticas,getEstados,createEstados,editEstados,deleteEstados,compararEstados } = require('../controllers/politicasEnvio.controllers');
const auth = require('../middleware/auth');

router.route('/')
    .get(getPoliticas)//Get all admin dates
    .post(auth,createPoliticas);//Add a admin 


router.route('/:id')
    .put(auth,updatePoliticas)//Update a admin

router.route('/estados/').post(auth,createEstados).get(getEstados);

router.route('/estados/:idEstado').put(editEstados).delete(deleteEstados);

router.route('/estado/municipio/:idMunicipio').get(compararEstados);

module.exports = router;