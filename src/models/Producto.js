var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,4);
const mongoodePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const ProductoSchema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true,
		trim: true
	},
	categoria: {
		type: String,
		required: true,
		trim: true
	},
	tipoCategoria: String,
	subCategoria: String,
	genero: String,
	tallas: [{
		talla: String,
		cantidad: Number
	}],
	numeros: [{
		numero: String,
		cantidad: Number
	}],
	color: String,
	colorHex: String,
	cantidad: {
		type: Number
	},
	precio: {
		type: Float,
		required: true
	},
	imagen: {
		type: String
	},
	descripcion: {
		type: String,
		trim: true
	},
	codigo: {
		type: String, 
		trim: true
	},
	activo: Boolean,
	eliminado: Boolean,
	temporada: String
},{
	timestamps: true
});

ProductoSchema.plugin(mongoodePaginate);
ProductoSchema.plugin(aggregatePaginate);

module.exports = mongoose.model('producto', ProductoSchema);
