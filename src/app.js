const express = require('express');
const cors = require('cors');
const app = express();

//settings
app.set('port', process.env.PORT || '0.0.0.0');
app.set('host',process.env.HOST || '0.0.0.0');

//const whitelist = ['https://brave-yonath-783630.netlify.app'];


/* const corsOptions = {
    origin: (origin,callback) => {
        const existe = whitelist.some(dominio => dominio === origin);
        if(existe){
            callback(null,true);
        }else{
            callback(new Error('Este server no tiene acceso'));
        }
    }
}
 */
//Middlewares cors con opcions
//app.use(cors(corsOptions));

//Middlewares cors sin opcions
app.use(cors());


app.use(express.json());

//rutes
app.use('/api/admin', require('./routes/administrador'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/pago', require('./routes/pagos'));
app.use('/api/cliente', require('./routes/cliente'));
//routes
app.use('/api/productos', require('./routes/productos'));
app.use('/api/galeria', require('./routes/galeria'));
app.use('/api/tienda', require('./routes/tienda'));
app.use('/api/apartado', require('./routes/apartado'));
app.use('/api/carrito', require('./routes/carrito'));
app.use('/api/sugerencia', require('./routes/sugerencia'));
app.use('/api/carousel', require('./routes/carousel'));
app.use('/api/politicasEnvio', require('./routes/politicasEnvio'));
app.use('/api/banner', require('./routes/bannerCategoria'));
app.use('/api/promocion', require('./routes/promocionesProducto'));
app.use('/api/home', require('./routes/home'));

//carpeta publica
app.use(express.static('uploads'));

module.exports = app;
