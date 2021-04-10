const {Schema,model} = require('mongoose');

const estadosModel = new Schema({
    estado: String,
    municipios: [{
        municipio: String
    }],
    todos: Boolean
})

module.exports = model('estados',estadosModel);

