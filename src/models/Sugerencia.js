const { Schema, model } = require('mongoose');

const SugerenciaSchema = new Schema({
    producto: {
        type: Schema.ObjectId,
        ref: 'producto'
    },
    sugerencias: [{
        producto: {
            type: Schema.ObjectId,
            ref: 'producto'
        }
    }]
});

module.exports = model('sugerencia', SugerenciaSchema);