const { Router } = require('express');
const router = Router();
const { getAdmins, deleteAdmin, createAdmin, getAdmin, updateAdmin, authAdmin } = require('../controllers/administrador.controllers');
const auth = require('../middleware/auth');

router.route('/auth')
.post(authAdmin);

router.route('/')
    .get(auth,getAdmins)//Get all admin dates
    .post(createAdmin);//Add a admin 


router.route('/:id')
    .get(auth,getAdmin)//Get one admin dates
    .put(auth,updateAdmin)//Update a admin
    .delete(auth,deleteAdmin);//Delete a admin

module.exports = router;