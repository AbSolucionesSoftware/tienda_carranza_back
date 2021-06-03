const { Router } = require('express');
const router = Router();

const auth = require('../middleware/auth');

const {
	getCliente,
	getClientes,
	createCliente,
	updateCliente,
	deleteCliente,
	subirImagen,
	authCliente,
	authFirebase,
	getClientesFiltrados,
	getClienteSinPaginacion,
	restablecerPassword,
	getVerificPass,
	resetPass,
	desAunth,
	agreegatePushToken
} = require('../controllers/cliente.controllers');

router.route('/todos').get(auth,getClienteSinPaginacion)

router.route('/restablecer/pass').post(restablecerPassword);

router.route('/restablecer/pass/:idPassword').put(getVerificPass);

router.route('/reset/pass').put(resetPass);

router.route('/auth').post(authCliente);

router.route('/auth/firebase').post(authFirebase);

router.route('/').get(auth,getClientes).post(createCliente);

router.route('/filtrados').get(auth,getClientesFiltrados);

router.route('/:id').get(auth,getCliente).put(subirImagen,updateCliente).delete(auth,deleteCliente);

router.route("/desauth/:id").post(desAunth);

router.route("/agregate/token/:idAdmin").post(agreegatePushToken);


module.exports = router;
