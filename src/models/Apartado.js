const { Schema, model } = require('mongoose');
const mongoodePaginate = require('mongoose-paginate-v2');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const ApartadoSchema = new Schema({
    producto: {
        type: Schema.ObjectId,
        ref: 'producto'
    },
    cliente: {
        type: Schema.ObjectId,
        ref: 'cliente'
    },
    cantidad: {
        type: Number,
    },
    precio: {
        type: String
    },
    medida: [{
        talla: String,
        numero: String
    }],
    estado: {
        type: String,
        required: true
    },
    tipoEntrega: {
        type: String,
    },
    url:{
        type: String
    },
    paqueteria: {
        type: String
    },
    codigo_seguimiento: {
        type: String
    },
    mensajeUser: String,
    fecha_envio: {
        type: Date
    },
    eliminado: Boolean,
    apartadoMultiple: [{
        producto: Schema.ObjectId,
        cantidad: Number,
        medida: {
            talla: String,
            numero: String
        },
        precio: String
    }],
    total: String
},
{
    timestamps: true
});

ApartadoSchema.plugin(mongoodePaginate);
ApartadoSchema.plugin(aggregatePaginate);

module.exports = model('apartado', ApartadoSchema);