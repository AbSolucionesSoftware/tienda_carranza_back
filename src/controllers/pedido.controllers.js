const pedidoCtrl = {};
const pedidoModel = require('../models/Pedido');
const email = require('../middleware/sendEmail');
const Tienda = require('../models/Tienda');
const politicasModel = require('../models/PoliticasEnvio');
const Carrito = require('../models/Carrito');
const adminModel = require("../models/Administrador");
const { sendNotification } = require("../middleware/pushNotification");

pedidoCtrl.getPedidos = async (req, res, next) => {
    try {
        const pedidos = await pedidoModel.find().populate('cliente').populate({
            path: 'pedido.producto',
            model: 'producto'
        });
        res.status(200).json(pedidos);
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
        next();
    }
}
pedidoCtrl.getPedidosAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
		const options = {
			page,
            limit: parseInt(limit),
            populate: ['cliente', { path: 'pedido.producto', model: 'producto'}],
            sort: { createdAt: -1 }
		}
        const pedidos = await pedidoModel.paginate({pagado: true}, options);
        res.status(200).json(pedidos);
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
        next();
    }
}
pedidoCtrl.getPedidosAdminFiltrados = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, filtro } = req.query;
        console.log(req.query);
		const options = {
			page,
            limit: parseInt(limit),
            populate: ['cliente', { path: 'pedido.producto', model: 'producto'}]
		}
        const pedidos = await pedidoModel.paginate({pagado: true, estado_pedido: filtro}, options);
        res.status(200).json(pedidos);
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
        next();
    }
}
pedidoCtrl.getPedido = async (req, res, next) => {
    try {
        const pedidos = await pedidoModel.findById(req.params.id).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'producto'
        });
        res.status(200).json(pedidos);
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
        next();
    }
}

pedidoCtrl.getTodosPedidosUser = async (req, res, next) => {
    try {
        const pedidosUser = await pedidoModel.find({ cliente: req.params.id }).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'producto'
        }).sort({ "createdAt" : -1});
        res.status(200).json(pedidosUser);
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
    }
}

pedidoCtrl.getPedidosUser = async (req, res, next) => {
    try {
        const pedidosUser = await pedidoModel.find({ cliente: req.params.id, pagado: true }).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'producto'
        }).sort({ "createdAt" : -1});
        res.status(200).json(pedidosUser);
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
    }
}

pedidoCtrl.generatePedidoPagado = async (req,res) => {
    try {
        const { pedidoCompleto } = req.body;
        console.log(pedidoCompleto);
        const pedidoUpdate = await pedidoModel.findById(pedidoCompleto._id).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'producto'
        });;
        const politicas = await politicasModel.find().populate("idTienda").populate("idAdministrador");
        const admin = await adminModel.find({});
        const tienda = await Tienda.find();
        const pedidoPopulate = await pedidoModel.findById(pedidoCompleto._id).populate("cliente").populate({
            path: 'pedido.producto',
            model: 'producto'
        });
        const nuevoPedido = await pedidoModel.findById(pedidoCompleto._id);
        // console.log(pedidoUpdate.cliente.expoPushTokens);
        await sendNotification(
            pedidoUpdate.cliente.expoPushTokens,
            "Orden realizada",
            "Tu orden esta en proceso, llegara en breve a tu domicilio.",
            {
                tipo: "Pedido",
                item: pedidoUpdate
            }
        );

        await sendNotification(
            admin[0].expoPushTokens,
            "Tienes una nueva orden",
            "Tienes un nuevo pedido a domicilio.",
            {
                tipo: "Pedido",
                item: pedidoUpdate
            }
        );

        const direction = {
            calle_numero: "",
            entre_calles: "",
            cp: "",
            colonia:"",
            ciudad: "",
            estado: "",
            pais: ""
        };
        if (pedidoUpdate) {
            if (pedidoCompleto.cliente.direccion.length > 0) {
                direction.calle_numero = pedidoUpdate.cliente.direccion[0].calle_numero;
                direction.entre_calles = pedidoUpdate.cliente.direccion[0].entre_calles;
                direction.cp = pedidoUpdate.cliente.direccion[0].cp;
                direction.colonia = pedidoUpdate.cliente.direccion[0].colonia;
                direction.ciudad = pedidoUpdate.cliente.direccion[0].ciudad;
                direction.estado = pedidoUpdate.cliente.direccion[0].estado;
                direction.pais = pedidoUpdate.cliente.direccion[0].pais;
            }
        }
        await pedidoModel.findByIdAndUpdate(pedidoCompleto._id, {direccion: direction});        
        // console.log(pedidoCompleto.cliente.direccion);
        await pedidoModel.findByIdAndUpdate(pedidoCompleto._id,{pagado: true, tipo_pago: "Pago en efectivo."});
        // console.log(nuevoPedido);
        if(pedidoCompleto.carrito === true){
            await Carrito.findOneAndDelete({ cliente: pedidoCompleto.cliente._id });
        }
        let pedidos = ``;
        let subTotal = 0;
        let politicasBase = 0;
        for(let i = 0; i < pedidoPopulate.pedido.length; i++){
            subTotal += parseFloat(pedidoPopulate.pedido[i].precio * pedidoPopulate.pedido[i].cantidad);
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
        const htmlContentAdmin = `
        <div>
            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tienes una nueva orden.</h3>
            <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">El cliente espera su orden.</h4>
    
            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle de la orden:</h3>
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

        const htmlContentUser = `
        <div>
            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu orden esta en proceso</h3>
            <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">La orden esta siendo procesada, si tienes alguna duda no dudes en contactarnos.</h4>
    
            <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle de la orden:</h3>
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
        </div>
        `;

        

        // console.log(pedidoPopulate.cliente.email);
        email.sendEmail(pedidoPopulate.cliente.email,"Orden realizada",htmlContentUser,tienda[0].nombre);

        email.sendEmail(admin[0].email,"Orden realizada",htmlContentAdmin,tienda[0].nombre);

        res.status(200).json({ message: 'Apartado creado', nuevoPedido });

    } catch (error) {
        res.status(500).json({ message: 'Ups, algo paso al generar la orden', error });
        console.log(error);
    }
}

pedidoCtrl.createPedido = async (req, res, next) => {

/*     newpedido.estado_pedido = "En proceso";
    newpedido.mensaje_admin = "Tu pedido esta siendo procesado"; */
    try {
        const newpedido = new pedidoModel(req.body);
        // console.log(req.body);
        newpedido.pagado = false;
        await newpedido.save((err, userStored) => {
            if (err) {
                // console.log(err);
                res.status(500).json({ message: 'Ups, algo paso al registrar el usuario', err });
            } else {
                if (!userStored) {
                    res.status(404).json({ message: 'Error al crear el Pedodo' });
                } else {
                    res.status(200).json({ message: "Se agrego el pedido",pedido: userStored });
                }
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Ups, algo paso al registrar el usuario', err });
        next();
    }
}

pedidoCtrl.updateEstadoPedido = async (req, res, next) => {
    try {
        const pedidoPagado = await pedidoModel.findById(req.params.id).populate("cliente");
        if(pedidoPagado.pagado === false){
            res.status(500).json({ message: 'Este pedido aun no a sido pagado'});
        }else{
            const { estado_pedido, mensaje_admin, url, paqueteria, codigo_seguimiento } = req.body;
            console.log(req.body);
            if(estado_pedido === "Enviado"){
                console.log("llego");
                const tienda = await Tienda.find();
                const pedidoPopulate = await pedidoModel.findById(req.params.id).populate("cliente").populate({
                    path: 'pedido.producto',
                    model: 'producto'
                });
                const politicas = await politicasModel.find().populate("idTienda").populate("idAdministrador");

                 await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    fecha_envio: new Date(),
                    estado_pedido,
                    mensaje_admin,
                    url,
                    paqueteria,
                    codigo_seguimiento
                }, { new: true });
                res.status(200).json({ message: 'Pedido Actualizado'});
                let pedidos = ``;
                let subTotal = 0;
                for(let i = 0; i < pedidoPopulate.pedido.length; i++){
                    subTotal += (parseFloat(pedidoPopulate.pedido[i].cantidad) * parseFloat(pedidoPopulate.pedido[i].precio));
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
                    
                    <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu pedido fue enviado!!</h3>
                    <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu pedido esta en camino, esperalo pronto.</h4>
            
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
                </div>`;
                await sendNotification(
                    pedidoPagado.cliente.expoPushTokens,
                    "Orden enviada",
                    "Tu orden esta en camino, pronto llegara a tu domicilio.",
                    {
                        tipo: "Pedido",
                        item: pedidoPopulate
                    }
                );
                email.sendEmail(pedidoPopulate.cliente.email,"Pedido realizado",htmlContentUser,tienda[0].nombre);
            }else if(estado_pedido === "Entregado"){
                const pedido = await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    fecha_envio: new Date(),
                    estado_pedido
                }, { new: true });
                const tienda = await Tienda.find();
                const pedidoPopulate = await pedidoModel.findById(req.params.id).populate("cliente").populate({
                    path: 'pedido.producto',
                    model: 'producto'
                })
                await sendNotification(
                    pedidoPagado.cliente.expoPushTokens,
                    "Orden entregada",
                    "Tu orden a sido entregada, espero la disfrutes!!",
                    {
                        tipo: "Pedido",
                        item: pedidoPopulate
                    }
                );
                res.status(200).json({ message: 'Pedido Actualizado'});
                const politicas = await politicasModel.find().populate("idTienda").populate("idAdministrador");
                let pedidos = ``;
                let subTotal = 0;
                for(let i = 0; i < pedidoPopulate.pedido.length; i++){
                    subTotal += (parseFloat(pedidoPopulate.pedido[i].cantidad) * parseFloat(pedidoPopulate.pedido[i].precio));
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
                    
                    <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu pedido fue entregado!!</h3>
                    <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Gracias por confiar en nosotros.</h4>
            
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
                </div>`;
                email.sendEmail(pedidoPopulate.cliente.email,"Pedido realizado",htmlContentUser,tienda[0].nombre);
            }else if(estado_pedido === "Tomado"){
                console.log("llego");
                const tienda = await Tienda.find();
                const pedidoPopulate = await pedidoModel.findById(req.params.id).populate("cliente").populate({
                    path: 'pedido.producto',
                    model: 'producto'
                });
                const politicas = await politicasModel.find().populate("idTienda").populate("idAdministrador");

                 await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    fecha_envio: new Date(),
                    estado_pedido,
                    mensaje_admin,
                    url,
                    paqueteria,
                    codigo_seguimiento
                }, { new: true });
                res.status(200).json({ message: 'Pedido Actualizado'});
                let pedidos = ``;
                let subTotal = 0;
                for(let i = 0; i < pedidoPopulate.pedido.length; i++){
                    subTotal += (parseFloat(pedidoPopulate.pedido[i].cantidad) * parseFloat(pedidoPopulate.pedido[i].precio));
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
                    
                    <h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tenemos noticias de tu edido!!</h3>
                    <h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu pedido fue tomado por el chef, esperalo pronto.</h4>
            
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

                await sendNotification(
                    pedidoPagado.cliente.expoPushTokens,
                    "Tu pedido a sido aceptado",
                    "El chef a tomado tu orden, pronto estara en camino.",
                    {
                        tipo: "Pedido",
                        item: pedidoPopulate
                    }
                );
                email.sendEmail(pedidoPopulate.cliente.email,"Pedido realizado",htmlContentUser,tienda[0].nombre);
            }else{
                const pedido = await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    mensaje_admin
                }, { new: true });
                console.log(pedido);
                res.status(200).json({ message: 'Mensaje del pedido actualizado', body: req.body});
            }
        }
    } catch (err) {
        res.status(500).json({ message: 'Ups, algo paso al obtener los pedidos', err });
        next();
    }
}

pedidoCtrl.updatePedido = async (req,res) => {
try {
    const {total} = req.body;
    const pedidoBase = await pedidoModel.findById(req.params.id);
    const newPedido = pedidoBase;
    newPedido.total = total;
    await pedidoModel.findByIdAndUpdate(req.params.id,newPedido);

    res.status(200).json({ message: "Pedido Actualizado" });

} catch (error) {
    res.status(500).json({ message: 'Ups, algo paso.', err });
}
}

module.exports = pedidoCtrl;