const { Schema, model } = require('mongoose');

const pagoSchema = new Schema({
    id_objeto_sesion_stripe: {
        type: String
    },
    intento_pago: {
        type: String
    },
    pedido: {
        type: Schema.ObjectId,
        ref: 'Pedidos'
    },
    cliente: {
        type: Schema.ObjectId,
        ref: 'cliente'
    }
}, {
    timestamps: true
});

module.exports = model('Pago', pagoSchema);