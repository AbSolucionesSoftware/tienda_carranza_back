const pedidoCtrl = {};

const pedidoModel = require('../models/Pedido');
const email = require('../middleware/sendEmail');
const Tienda = require('../models/Tienda');
const politicasModel = require('../models/PoliticasEnvio');

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

pedidoCtrl.createPedido = async (req, res, next) => {

/*     newpedido.estado_pedido = "En proceso";
    newpedido.mensaje_admin = "Tu pedido esta siendo procesado"; */
    try {
        const newpedido = new pedidoModel(req.body);
        console.log(req.body);
        newpedido.pagado = false;
        await newpedido.save((err, userStored) => {
            if (err) {
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
        res.status(500).json({ message: 'Ups, algo paso al registrar el usuario', err });
        next();
    }
}

pedidoCtrl.updateEstadoPedido = async (req, res, next) => {
    try {
        const pedidoPagado = await pedidoModel.findById(req.params.id);
        if(pedidoPagado.pagado === false){
            res.status(500).json({ message: 'Este pedido aun no a sido pagado'});
        }else{
            const {estado_pedido,mensaje_admin,url,paqueteria,codigo_seguimiento} = req.body;
            if(estado_pedido === "Enviado"){
                const pedido = await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    fecha_envio: new Date(),
                    estado_pedido,
                    mensaje_admin,
                    url,
                    paqueteria,
                    codigo_seguimiento
                }, { new: true });
                res.status(200).json({ message: 'Pedido Actualizado'});

                const tienda = await Tienda.find();
                const pedidoPopulate = await pedidoModel.findById(req.params.id).populate("cliente").populate({
                    path: 'pedido.producto',
                    model: 'producto'
                })
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
                
                email.sendEmail(pedidoPopulate.cliente.email,"Pedido realizado",htmlContentUser,tienda[0].nombre);
            }else if(estado_pedido === "Entregado"){
                const pedido = await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    fecha_envio: new Date(),
                    estado_pedido
                }, { new: true });
                res.status(200).json({ message: 'Pedido Actualizado'});

                const tienda = await Tienda.find();
                const pedidoPopulate = await pedidoModel.findById(req.params.id).populate("cliente").populate({
                    path: 'pedido.producto',
                    model: 'producto'
                })
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
            }else{
                const pedido = await pedidoModel.findByIdAndUpdate({ _id: req.params.id }, {
                    mensaje_admin
                }, { new: true });
                console.log(pedido);
                res.status(200).json({ message: 'Mensaje del pedido actualizado'});
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