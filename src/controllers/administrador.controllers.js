const adminCtrl = {};
const bcrypt = require('bcrypt-nodejs');
const adminModel = require('../models/Administrador');
const jwt = require('jsonwebtoken')

adminCtrl.getAdmins = async (req, res) => {
	try {
		const admins = await adminModel.find();
		res.json(admins);
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })	
	}

};

adminCtrl.createAdmin = async (req, res) => {
	try {
		const newAdmin = new adminModel();
		const { nombre, email, contrasena, repeatContrasena } = req.body;
	
		newAdmin.nombre = nombre;
		newAdmin.email = email;
		newAdmin.rol = true;
		newAdmin.activo = false;
	
		if (!contrasena || !repeatContrasena) {
			res.status(404).json({ message: 'Las contrasenas son obligatorias' });
		} else {
			if (contrasena !== repeatContrasena) {
				res.status(404).json({ message: 'Las contrasenas no son iguales' });
			} else {
				bcrypt.hash(contrasena, null, null, function(err, hash) {
					if (err) {
						res.status(500).json({ message: 'Error al encriptar la contrasena' });
					} else {
						newAdmin.contrasena = hash;
						newAdmin.save((err, userStored) => {
							if (err) {
								res.status(500).json({ message: 'Ups, algo paso al registrar el usuario',err });
							} else {
								if (!userStored) {
									res.status(404).json({ message: 'Error al crear el usuario' });
								} else {
									const token = jwt.sign({
										email : newAdmin.email,
										nombre: newAdmin.nombre,
										_id: newAdmin._id,
										rol: newAdmin.rol
									},
									process.env.AUTH_KEY,
									);
									res.status(200).json(token);
								}
							}
						});
					}
				});
			}
		}
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })	
	}
};

adminCtrl.updateAdmin = async (req, res) => {
	try {
		const { nombre, email, contrasena, imagen } = req.body;
		const admin = await adminModel.findById(req.params.id);
		if (imagen == null && admin.imagen != null) {
			newimagen = admin.imagen;
			await adminModel.findByIdAndUpdate(req.params.id, {
				nombre,
				email,
				contrasena,
				imagen: admin.imagen
			});
		} else {
			await adminModel.findByIdAndUpdate(req.params.id, {
				nombre,
				email,
				contrasena,
				imagen
			});
		}
		res.json({ message: 'Admin Update' });
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })	
	}

};

adminCtrl.getAdmin = async (req, res) => {
	try {
		const admin = await adminModel.findById(req.params.id);
		res.json(admin);
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })	
	}

};

adminCtrl.deleteAdmin = async (req, res) => {
	try {
		await adminModel.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: 'Admin Deleted' });
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })	
	}

};

adminCtrl.authAdmin = async (req, res, next) => {
	try {
		const { email, contrasena } = req.body;
		const admin = await adminModel.findOne({ email });
	
		if(!admin){
			await res.status(401).json({ message: 'Este usuario no existe' });
		}else{
			if(!bcrypt.compareSync(contrasena, admin.contrasena)){
				await res.status(401).json({ message: 'Contraseña incorrecta' });
				next();
			}else{
				const token = jwt.sign({
					email : admin.email,
					nombre: admin.nombre,
					_id: admin._id,
					rol: admin.rol
				},
				process.env.AUTH_KEY,
	/* 			{
					expiresIn : '1h'
				} */);
				//token
				res.json(token);
			}
		}
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })	
	}
}

module.exports = adminCtrl;
