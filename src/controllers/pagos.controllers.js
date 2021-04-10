const pagoCtrl = {};
const pagoModel = require('../models/Pago');
const Stripe = require('stripe');
const productoModel = require('../models/Producto');
const pedidoModel = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const email = require('../middleware/sendEmail');
const Tienda = require('../models/Tienda');
const politicasModel = require('../models/PoliticasEnvio');

pagoCtrl.createPago = async (req, res) => {
    try {
        const {sesionStripe,pedidoCompleto,amount} = req.body;
        console.log(req.body);
        const stripe = new Stripe(process.env.LLAVE_SECRETA_STRIPE);
     
        let sesion = "";
        if(sesionStripe.id){
            sesion = sesionStripe.id;
        }else{
            sesion = sesionStripe.tokenId;
        }
        

       const payment = await stripe.paymentIntents.create({
            amount,
            currency:"MXN",
            description: pedidoCompleto._id,
            payment_method_types: ['card'], 
            payment_method: sesion,
            confirm:true
        })

        

        if(payment){
            const newPago = new pagoModel({
                id_objeto_sesion_stripe: sesionStripe.id,
                intento_pago: payment.id,
                pedido: pedidoCompleto._id,
                cliente: pedidoCompleto.cliente._id
            });
            

            await newPago.save(async (err, postStored) => {
                if (err) {
                    res.status(500).json({ message: "Error en el servidor" })
                } else {
                    if (!postStored) {
                        res.status(404).json({ message: "No se a podido crear el Pago" });
                    } else {
                        const pedidoBase = await pedidoModel.findById(pedidoCompleto._id)
                        pedidoBase.pedido.map(async (pedido) => {
                            if(pedido.talla){
                                const producto = await productoModel.findById(pedido.producto);
                                producto.tallas.map(async (talla) => {
                                    if(talla.talla == pedido.talla){
                                        if(talla.cantidad == '0' || talla.cantidad < pedido.cantidad){
                                            res.status(500).send({ message: 'No existen suficientes productos en el inventario' })
                                            throw talla.cantidad;
                                        }else{
                                            let cantidad = talla.cantidad - pedido.cantidad;
                                            await productoModel.updateOne(
                                                {
                                                    'tallas._id': talla._id
                                                },
                                                {
                                                    $set: { 'tallas.$': { 
                                                        talla: talla.talla, 
                                                        cantidad: cantidad } }
                                                }, async (err, response) => {
                                                    if (err) {
                                                        res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                        throw err;
                                                    } else {
                                                        if (!response) {
                                                            res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                            throw err;
                                                        }else{
                                                            const productoNuevo = await productoModel.findById(pedido.producto);
                                                            let contador = 0;
                                                            for(let i = 0; i < productoNuevo.tallas.length; i++){
                                                                contador += productoNuevo.tallas[i].cantidad;
                                                            }
                                                            console.log(contador);
                                                            if(contador === 0){
                                                                productoNuevo.activo  = false;
                                                                await productoModel.findByIdAndUpdate(productoNuevo._id,productoNuevo);
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }) 
                            }else if(pedido.numero){
                                const producto = await productoModel.findById(pedido.producto);
                                producto.numeros.map(async (numero) => {
                                    if(numero.numero == pedido.numero){
                                        if(numero.cantidad == '0' || numero.cantidad < pedido.cantidad){
                                            res.status(500).send({ message: 'No existen suficientes productos en el inventario' })
                                            throw numero.cantidad;
                                        }else{
                                            let cantidad = numero.cantidad - pedido.cantidad;
                                            await productoModel.updateOne(
                                                {
                                                    'numeros._id': numero._id
                                                },
                                                {
                                                    $set: { 'numeros.$': { 
                                                        numero: numero.numero, 
                                                        cantidad: cantidad } }
                                                },async (err, response) => {
                                                    if (err) {
                                                        res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                        throw err;
                                                    } else {
                                                        if (!response) {
                                                            res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                            throw err;
                                                        }else{
                                                            const productoNuevo = await productoModel.findById(pedido.producto);
                                                            let contador = 0;
                                                            for(let i = 0; i < productoNuevo.numeros.length; i++){
                                                                contador += productoNuevo.numeros[i].cantidad;
                                                            }
                                                            console.log(contador);
                                                            if(contador === 0){
                                                                productoNuevo.activo  = false;
                                                                await productoModel.findByIdAndUpdate(productoNuevo._id,productoNuevo);
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }) 
                            }else{
                                const producto = await productoModel.findById(pedido.producto);
                                const newProducto = producto;
                                if(producto.cantidad == 0 || producto.cantidad < pedido.cantidad){
                                    res.status(500).send({ message: 'No existen suficientes en el inventario' })
                                    throw error;
                                }else{
                                    newProducto.cantidad = parseInt(producto.cantidad) - parseInt(pedido.cantidad);
                                    await productoModel.findByIdAndUpdate(pedido.producto, newProducto,async (err, userStored) => {
                                       if (err) {
                                           throw userStored;
                                       } else {
                                           if (!userStored) {
                                               throw userStored;
                                           }else{
                                                const productoNuevo = await productoModel.findById(pedido.producto);
                                                console.log(productoNuevo.cantidad);
                                                if(productoNuevo.cantidad === 0){
                                                    productoNuevo.activo  = false;
                                                    await productoModel.findByIdAndUpdate(productoNuevo._id,productoNuevo);
                                                }
                                           }
                                       }
                                   });
                                }
                            }
                        })
                        if(pedidoCompleto.carrito === true){
                            await Carrito.findOneAndDelete({ cliente: pedidoCompleto.cliente._id });
                        }

                        const pedidoPagado = await pedidoModel.findById(pedidoCompleto._id);
                        pedidoPagado.pagado = true;  
                         await pedidoModel.findByIdAndUpdate({ _id: pedidoPagado._id },pedidoPagado, { new: true },(err, userStored) => {
                            if (err) {
                                res.status(500).send({ message: 'Ups, parece que algo salio mal', err });
                            } else {
                                if (!userStored) {
                                    res.status(404).send({ message: 'Error al actualizar pedido' });
                                } else {
                                    res.status(200).json({ message: "Pago realzado con exito" });
                                }
                            }
                        });

                        const tienda = await Tienda.find();
                        const pedidoPopulate = await pedidoModel.findById(pedidoCompleto._id).populate("cliente").populate({
                            path: 'pedido.producto',
                            model: 'producto'
                        })
                        const politicas = await politicasModel.find().populate("idTienda").populate("idAdministrador");
                        
                        let pedidos = ``;
                        let subTotal = 0;
                        
                        
                        for(let i = 0; i < pedidoPopulate.pedido.length; i++){
                            subTotal += parseFloat(pedidoPopulate.pedido[i].precio);
                            pedidos += `
                            <tr>
                                <td style="  padding: 15px; text-align: left;"><img style="max-width: 150px; display:block; margin:auto;" class="" src="${process.env.URL_IMAGEN_AWS}${pedidoPopulate.pedido[i].producto.imagen}" /></td>
                                <td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;" > ${pedidoPopulate.pedido[i].producto.nombre}</p></td>
                                <td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> ${pedidoPopulate.pedido[i].cantidad}</p></td>
                                <td style="  padding: 15px; text-align: left;">
                                    ${pedidoPopulate.pedido[i].numero || pedidoPopulate.pedido[i].talla ? pedidoPopulate.pedido[i].numero ? 
                                        `<p style="text-align: center; font-family: sans-serif;"> ${pedidoPopulate.pedido[i].numero}</p>` : 
                                        `<p style="text-align: center; font-family: sans-serif;"> ${pedidoPopulate.pedido[i].talla}</p>`:
                                        `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">No aplica</span></p>`
                                    }
                                </td>
                                <td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> $ ${pedidoPopulate.pedido[i].precio}</p></td>
                            </tr>
                            `;
                        }
            
                        const htmlContentUser = `
                        <div>
                            <div style="margin:auto; max-width: 550px; height: 100px;">
                                ${tienda[0].imagenLogo ? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`:""} 
                            </div>
                            
                            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu pedido esta en proceso</h3>
                            <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">El pedido esta siendo procesado, si tienes alguna duda no dudes en contactarnos.</h4>
                    
                            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle del pedido:</h3>
                            <div style="margin:auto; max-width: 550px;">
                                <table >
                                    <tr>
                                        
                                        <td style="  padding: 15px; text-align: left;"><strong>Producto</strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong></strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong>Cantidad</strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong>Medida</strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong>Precio</strong></td>
                                    </tr>
                                    ${pedidos}
                                </table>
                                <h3 style=" margin:auto; margin-left: 360px;"><strong>Sub total: </strong>$ ${subTotal}</h3>
                                <h3 style=" margin:auto; margin-left: 360px;"><strong>Costo de envio: </strong>$ ${politicas[0].costoEnvio}</h3>
                                ${subTotal >= politicas[0].promocionEnvio ? 
                                `<h3 style=" color: #CC2300; margin:auto; margin-left: 360px;"><strong>Descuento: </strong>- $${politicas[0].descuento}</h3>`    
                                :"" }
                                <h3 style=" color: #2DD703; margin:auto; margin-left: 360px;"><strong>Total: </strong>$ ${pedidoPopulate.total}</h3>
                                
                            </div>
                            <div style="margin:auto; max-width: 550px; height: 100px;">
                                <p style="padding: 10px 0px;">Ya estamos trabajando para mandar tu pedido, si tienes alguna duda no dudes en contactarnos.</p>
                            </div>
                        </div>
                        `;
                        
                        email.sendEmail(pedidoPopulate.cliente.email,"Pedido realizado",htmlContentUser,tienda[0].nombre);


                    }
                }
            });
        }else{
            res.status(404).json({ message: "No se a podido crear el Pago" });
        }

    } catch (err) {
        res.status(500).json({ message: "Error en el servidor",err });	
        console.log(err);
    }

}

pagoCtrl.obtenerPagosCliente = async (req, res) => {
	try {
        const pagos = await pagoModel.find({cliente: req.params.idCliente}).populate('pedido cliente');
		res.status(200).json(pagos);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
		next();
	}
};


pagoCtrl.createPagoMovil = async (req,res) => {
    try {
        const {sesionStripe,pedidoCompleto,amount} = req.body;
        const stripe = new Stripe(process.env.LLAVE_SECRETA_STRIPE);
        console.log(req.body);
        const payment = await stripe.charges.create({
            amount: amount,
            currency: 'mxn',
            description: pedidoCompleto._id,
            source: sesionStripe.id,
          });

          if(payment){
            const newPago = new pagoModel({
                id_objeto_sesion_stripe: sesionStripe.id,
                intento_pago: payment.id,
                pedido: pedidoCompleto._id,
                cliente: pedidoCompleto.cliente._id
            });
            await newPago.save(async (err, postStored) => {
                if (err) {
                    res.status(500).json({ message: "Error en el servidor" })
                } else {
                    if (!postStored) {
                        res.status(404).json({ message: "No se a podido crear el Pago" });
                    } else {
                        const pedidoBase = await pedidoModel.findById(pedidoCompleto._id)
                        pedidoBase.pedido.map(async (pedido) => {
                            if(pedido.talla){
                                const producto = await productoModel.findById(pedido.producto);
                                producto.tallas.map(async (talla) => {
                                    if(talla.talla == pedido.talla){
                                        if(talla.cantidad == '0' || talla.cantidad < pedido.cantidad){
                                            res.status(500).send({ message: 'No existen suficientes productos en el inventario' })
                                            throw talla.cantidad;
                                        }else{
                                            let cantidad = talla.cantidad - pedido.cantidad;
                                            await productoModel.updateOne(
                                                {
                                                    'tallas._id': talla._id
                                                },
                                                {
                                                    $set: { 'tallas.$': { 
                                                        talla: talla.talla, 
                                                        cantidad: cantidad } }
                                                }, async (err, response) => {
                                                    if (err) {
                                                        res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                        throw err;
                                                    } else {
                                                        if (!response) {
                                                            res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                            throw err;
                                                        }else{
                                                            const productoNuevo = await productoModel.findById(pedido.producto);
                                                            let contador = 0;
                                                            for(let i = 0; i < productoNuevo.tallas.length; i++){
                                                                contador += productoNuevo.tallas[i].cantidad;
                                                            }
                                                            console.log(contador);
                                                            if(contador === 0){
                                                                productoNuevo.activo  = false;
                                                                await productoModel.findByIdAndUpdate(productoNuevo._id,productoNuevo);
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }) 
                            }else if(pedido.numero){
                                const producto = await productoModel.findById(pedido.producto);
                                producto.numeros.map(async (numero) => {
                                    if(numero.numero == pedido.numero){
                                        if(numero.cantidad == '0' || numero.cantidad < pedido.cantidad){
                                            res.status(500).send({ message: 'No existen suficientes productos en el inventario' })
                                            throw numero.cantidad;
                                        }else{
                                            let cantidad = numero.cantidad - pedido.cantidad;
                                            await productoModel.updateOne(
                                                {
                                                    'numeros._id': numero._id
                                                },
                                                {
                                                    $set: { 'numeros.$': { 
                                                        numero: numero.numero, 
                                                        cantidad: cantidad } }
                                                },async (err, response) => {
                                                    if (err) {
                                                        res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                        throw err;
                                                    } else {
                                                        if (!response) {
                                                            res.status(500).send({ message: 'Ups algo paso al restar la talla' })
                                                            throw err;
                                                        }else{
                                                            const productoNuevo = await productoModel.findById(pedido.producto);
                                                            let contador = 0;
                                                            for(let i = 0; i < productoNuevo.numeros.length; i++){
                                                                contador += productoNuevo.numeros[i].cantidad;
                                                            }
                                                            console.log(contador);
                                                            if(contador === 0){
                                                                productoNuevo.activo  = false;
                                                                await productoModel.findByIdAndUpdate(productoNuevo._id,productoNuevo);
                                                            }
                                                        }
                                                    }
                                                }
                                            );
                                        }
                                    }
                                }) 
                            }else{
                                const producto = await productoModel.findById(pedido.producto);
                                const newProducto = producto;
                                if(producto.cantidad == 0 || producto.cantidad < pedido.cantidad){
                                    res.status(500).send({ message: 'No exixten suficientes en el inventario' })
                                    throw error;
                                }else{
                                    newProducto.cantidad = parseInt(producto.cantidad) - parseInt(pedido.cantidad);
                                    await productoModel.findByIdAndUpdate(pedido.producto, newProducto,async (err, userStored) => {
                                       if (err) {
                                           throw userStored;
                                       } else {
                                           if (!userStored) {
                                               throw userStored;
                                           }else{
                                                const productoNuevo = await productoModel.findById(pedido.producto);
                                                console.log(productoNuevo.cantidad);
                                                if(productoNuevo.cantidad === 0){
                                                    productoNuevo.activo  = false;
                                                    await productoModel.findByIdAndUpdate(productoNuevo._id,productoNuevo);
                                                }
                                           }
                                       }
                                   });
                                }
                            }
                        })
                        if(pedidoCompleto.carrito === true){
                            await Carrito.findOneAndDelete({ cliente: pedidoCompleto.cliente._id });
                        }
                        const pedidoPagado = await pedidoModel.findById(pedidoCompleto._id);
                        pedidoPagado.pagado = true;  
                         await pedidoModel.findByIdAndUpdate({ _id: pedidoPagado._id },pedidoPagado, { new: true },(err, userStored) => {
                            if (err) {
                                res.status(500).send({ message: 'Ups, parece que algo salio mal', err });
                            } else {
                                if (!userStored) {
                                    res.status(404).send({ message: 'Error al actualizar pedido' });
                                } else {
                                    res.status(200).json({ message: "Pago realizado con éxito" });
                                }
                            }
                        });

                        const tienda = await Tienda.find();
                        const pedidoPopulate = await pedidoModel.findById(pedidoCompleto._id).populate("cliente").populate({
                            path: 'pedido.producto',
                            model: 'producto'
                        })
                        const politicas = await politicasModel.find().populate("idTienda").populate("idAdministrador");
                        
                        let pedidos = ``;
                        let subTotal = 0;
                        
                        for(let i = 0; i < pedidoPopulate.pedido.length; i++){
                            subTotal += parseFloat(pedidoPopulate.pedido[i].precio);
                            pedidos += `
                            <tr>
                                <td style="  padding: 15px; text-align: left;"><img style="max-width: 150px; display:block; margin:auto;" class="" src="${process.env.URL_IMAGEN_AWS}${pedidoPopulate.pedido[i].producto.imagen}" /></td>
                                <td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;" > ${pedidoPopulate.pedido[i].producto.nombre}</p></td>
                                <td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> ${pedidoPopulate.pedido[i].cantidad}</p></td>
                                <td style="  padding: 15px; text-align: left;">
                                    ${pedidoPopulate.pedido[i].numero ? pedidoPopulate.pedido[i].numero ? 
                                        `<p style="text-align: center; font-family: sans-serif;"> ${pedidoPopulate.pedido[i].numero}</p>` : 
                                        `<p style="text-align: center; font-family: sans-serif;"> ${pedidoPopulate.pedido[i].talla}</p>`:
                                        `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">No aplica</span></p>`
                                    }
                                </td>
                                <td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> $ ${pedidoPopulate.pedido[i].precio}</p></td>
                            </tr>
                            `;
                        }
            
                        const htmlContentUser = `
                        <div>
                            <div style="margin:auto; max-width: 550px; height: 100px;">
                                ${tienda[0].imagenLogo ? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`:""} 
                            </div>
                            
                            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu pedido esta en proceso</h3>
                            <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">El pedido esta siendo procesado, si tienes alguna duda no dudes en contactarnos.</h4>
                    
                            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle del pedido:</h3>
                            <div style="margin:auto; max-width: 550px;">
                                <table >
                                    <tr>
                                        
                                        <td style="  padding: 15px; text-align: left;"><strong>Producto</strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong></strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong>Cantidad</strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong>Medida</strong></td>
                                        <td style="  padding: 15px; text-align: left;"><strong>Precio</strong></td>
                                    </tr>
                                    ${pedidos}
                                </table>
                                <h3 style=" margin:auto; margin-left: 360px;"><strong>Sub total: </strong>$ ${subTotal}</h3>
                                <h3 style=" margin:auto; margin-left: 360px;"><strong>Costo de envio: </strong>$ ${politicas[0].costoEnvio}</h3>
                                ${subTotal >= politicas[0].promocionEnvio ? 
                                `<h3 style=" color: #CC2300; margin:auto; margin-left: 360px;"><strong>Descuento: </strong>- $${politicas[0].descuento}</h3>`    
                                :"" }
                                <h3 style=" color: #2DD703; margin:auto; margin-left: 360px;"><strong>Total: </strong>$ ${pedidoPopulate.total}</h3>
                                
                            </div>
                            <div style="margin:auto; max-width: 550px; height: 100px;">
                                <p style="padding: 10px 0px;">Ya estamos trabajando para mandar tu pedido, si tienes alguna duda no dudes en contactarnos.</p>
                            </div>
                        </div>
                        `;
                        
                        email.sendEmail(pedidoPopulate.cliente.email,"Pedido realizado",htmlContentUser,tienda[0].nombre);
                    }
                }
            });
        }else{
            res.status(404).json({ message: "No se a podido crear el Pago" });
        }
          
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor",error });	
        console.log(error);
    }
}

module.exports = pagoCtrl;
