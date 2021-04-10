var mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose,4);
const mongoodePaginate = require('mongoose-paginate-v2');

const { Schema, model } = mongoose;

const PromocionSchema = new Schema({
    productoPromocion: {
        type: Schema.ObjectId,
        ref: 'producto'
    },
    precioPromocion: Float,
    imagenPromocion: String,
    idPromocionMasiva: String,
    porsentajePromocionMasiva: String
});

PromocionSchema.plugin(mongoodePaginate);

module.exports = model('promocion', PromocionSchema);