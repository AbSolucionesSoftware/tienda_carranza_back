const {Schema,model} = require('mongoose');

const bannerCategoria = new Schema({
    estilo: Number,
    banners: [{
        orientacion: Number,
        imagenBanner: String,
        vincular: Boolean,
        mostrarProductos: Boolean,
        mostrarTitulo: Boolean,
        tipo: {
            categoria: String,
            temporada: String,
            genero: String
        },
    }],
    publicado: Boolean
},{
    timestamps: true
})

module.exports = model('bannerCategoria',bannerCategoria);