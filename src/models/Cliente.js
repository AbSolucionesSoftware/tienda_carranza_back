const { Schema, model } = require('mongoose');
const mongoodePaginate = require('mongoose-paginate-v2');

const ClienteSchema = new Schema({
	nombre: {
		type: String,
		required: true,
		trim: true
	},
	apellido: {
		type: String
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase:true,
		trim:true
	},
	telefono: {
		type: String
	},
	active: Boolean,
	direccion: [
		{
			calle_numero: {
				type: String
			},
			entre_calles: {
				type: String
			},
			cp: {
				type: String
			},
			colonia: {
				type: String
			},
			ciudad: {
				type: String
			},
			estado: {
				type: String
			},
			pais: {
				type: String
			}
		}
	],
	contrasena: {
		type: String,
		required: true
	},
	imagen: String,
	tipoSesion: String,
	aceptarPoliticas: Boolean,
	modalMunicipio: Boolean
});

ClienteSchema.plugin(mongoodePaginate);

module.exports = model('cliente', ClienteSchema);
