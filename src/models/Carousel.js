const { Schema, model } = require('mongoose');

const CarouselSchema = new Schema({
    producto: String,
    nombre: String,
    imagen: String
},
{
    timestamps: true
});

module.exports = model('carousel', CarouselSchema);