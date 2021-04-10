const { Schema,model } = require('mongoose');

const recuperacionModel = new Schema({
    correoUsuario: String,
    codigoVerificacion: String,
    activo: Boolean
});

module.exports = model('recuperacion',recuperacionModel);