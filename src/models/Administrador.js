const { Schema, model } = require('mongoose');

const adminSchema = new Schema(
	{
		nombre: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		contrasena: {
			type: String,
			required: true
		},
		rol: Boolean,
		imagen: {
			type: String
		},
		fecha: {
			type: Date,
			default: Date.now
		},
		activo: Boolean
	},
	{
		timestamps: true
	}
);

module.exports = model('Administrador', adminSchema);
