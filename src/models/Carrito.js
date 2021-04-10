var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,4);

const CarritoSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.ObjectId,
        ref: 'cliente'
    },
    articulos: [{
        idarticulo: {
            type: mongoose.Schema.ObjectId,
            ref: "producto"
        },
        cantidad: {
            type: Number,
            required: true
        },
        medida: [{
            talla: String,
            numero: String
        }],
        subtotal: {
            type: Float,
            required: true
        }
    }]
});

module.exports = mongoose.model('carrito', CarritoSchema);
