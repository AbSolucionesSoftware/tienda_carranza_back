const { Schema, model } = require('mongoose');

const GaleriaSchema = new Schema({
    producto: {
        type: Schema.ObjectId,
        ref: 'producto'
    },
    imagenes: [{
        url: String
    }]
});

module.exports = model('galeria', GaleriaSchema);