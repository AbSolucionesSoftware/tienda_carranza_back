const { Schema, model } = require('mongoose');

const mongoodePaginate = require('mongoose-paginate-v2');

const blogSchema = new Schema({
    nombre: {
        type: String
    },
    administrador: {
        type: String
    },
    descripcion: {
        type: String
    },
    url: {
        type: String,
        unique: true
    },
    imagen: {
        type: String
    }
}, {
    timestamps: true
});

blogSchema.plugin(mongoodePaginate);

module.exports = model('Blog', blogSchema);