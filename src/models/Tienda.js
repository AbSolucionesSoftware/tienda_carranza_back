const { Schema, model } = require('mongoose');

const TiendaSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    direccion: [
        {
            calle_numero: {
                type: String
            },
            cp: {
                type: String
            }, 
            colonia: {
                type: String
            },
            ciudad: {
                type: String
            },
            estado: {
                type: String
            }
    
        }
    ],
    telefono: {
        type: String,
        required: true
    },
    ubicacion: [{
        lat: String,
        lng: String
    }],
    imagenCorp: {
        type: String
    },
    activo: Boolean,
    imagenLogo:{
        type:String
    },
    linkFace: String,
    linkInsta: String,
    linkTweeter: String,
    politicas: String,
    politicasVentas: String,
    politicasEnvios: String,
    politicasDescuentos: String,
    politicasDevolucion: String,
    diasHorariosEmpresas: String,
    horario:[{
        dia: String,
        key: Number,
        horarioInicial: String,
        horarioFinal: String,
        close: Boolean
    }],
    colorPage:{
        navPrimary: {
            text: String,
            background: String,
            hoverText: String
        },
        navSecondary: {
            text: String,
            background: String,
            hoverText: String
        },
        footer: {
            text: String,
            background: String,
        },
        bodyPage: {
            text: String,
            background: String,
            hoverText: String,
            card: {
                text: String,
                background: String
            }
        }
    }
});

module.exports = model('tienda', TiendaSchema);