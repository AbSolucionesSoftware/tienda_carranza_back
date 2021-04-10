const mongoose = require('mongoose');

var Float = require('mongoose-float').loadType(mongoose,4);

const PoliticasEnvio = new mongoose.Schema({
    idTienda: {
        type: mongoose.Schema.ObjectId,
        ref: 'tienda'
    },
    idAdministrador: {
        type: mongoose.Schema.ObjectId,
        ref: 'Administrador'
    },
    costoEnvio: {
        type: Float
    },
    promocionEnvio: {
        type: Float
    },
    descuento:{
        type: Float
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('PoliticasEnvio', PoliticasEnvio);