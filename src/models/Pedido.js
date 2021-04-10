
var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,4);
const mongoodePaginate = require('mongoose-paginate-v2');

const pedidosSchema = new mongoose.Schema(
	{
		cliente: {
			type: mongoose.Schema.ObjectId,
			ref: 'cliente'
		},
		fecha_envio: {
			type: Date
		},
		pedido: [
			{
				producto: {
					type: mongoose.Schema.ObjectId,
					ref: 'producto'
				},
				cantidad: Number,
				talla: String,
				numero: String,
				precio: String
			}
		],
		total: {
			type: Float
		},
		carrito: Boolean,
		estado_pedido: {
			type: String
		},
		mensaje_admin: String,
		pagado: Boolean,
		url:{
			type: String
		},
		paqueteria: {
			type: String
		},
		codigo_seguimiento: {
			type: String
		}
	
	},
	{
		timestamps: true
	}
);

pedidosSchema.plugin(mongoodePaginate);

module.exports = mongoose.model('Pedidos', pedidosSchema);
