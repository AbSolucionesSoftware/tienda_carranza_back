const apartadoCtrl = {};
const Apartado = require('../models/Apartado');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');
const email = require('../middleware/sendEmail');
const clienteModel = require('../models/Cliente');
const adminModel = require('../models/Administrador');
const Tienda = require('../models/Tienda');
const Carrito = require('../models/Carrito');

apartadoCtrl.agregarApartado = async (req, res) => {
	console.log(req.body);
	const { producto, cliente, cantidad, estado, medida, tipoEntrega,precio } = req.body;
	const datosProducto = await Producto.find({ _id: producto });
	const newApartado = new Apartado({ producto, cliente, cantidad, estado, medida, tipoEntrega, precio });
	newApartado.eliminado = false;
	const clienteBase = await clienteModel.findById(cliente);
	const admin = await adminModel.find({});
	const tienda = await Tienda.find();

	if (req.body.medida) {
		if (medida[0].numero) {
			datosProducto[0].numeros.map(async (numero) => {
				if (numero.numero == medida[0].numero) {
					if (cantidad > numero.cantidad) {
						res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
					} else {
						await newApartado.save((err, response) => {
							if (err) {
								res.status(500).json({ message: 'Hubo un error al crear apartado', err });
							} else {
								if (!response) {
									res.status(404).json({ message: 'Error al Crear apartado' });
								} else {
									res.status(200).json({ message: 'Apartado creado', response });
								}
							}
						});
					}
				}
			});
		} else if (medida[0].talla) {
			datosProducto[0].tallas.map(async (talla) => {
				if (talla.talla == medida[0].talla) {
					if (cantidad > talla.cantidad) {
						res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
					} else {
						await newApartado.save((err, response) => {
							if (err) {
								res.status(500).json({ message: 'Hubo un error al crear apartado', err });
							} else {
								if (!response) {
									res.status(404).json({ message: 'Error al Crear apartado' });
								} else {
									res.status(200).json({ message: 'Apartado creado', response });
								}
							}
						});
					}
				}
			});
		}
	} else {
		console.log(datosProducto);
		if (cantidad > datosProducto[0].cantidad) {
			res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
		} else {
			await newApartado.save((err, response) => {
				if (err) {
					res.status(500).json({ message: 'Hubo un error al crear apartado', err });
				} else {
					if (!response) {
						res.status(404).json({ message: 'Error al Crear apartado' });
					} else {
						res.status(200).json({ message: 'Apartado creado', response });
					}
				}
			});
		}
	}

	const htmlContent = `
	<div>
		<div style="margin:auto; max-width: 550px; height: 100px;;">
			${tienda[0].imagenLogo
				? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env
						.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`
				: ''} 
		</div>
		<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tienes una nueva solicitud de apartado</h3>
		<div style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);transition: 0.3s; width: 350px; display:block; margin:auto;">
			<img style="max-width: 200px; display:block; margin:auto;" class="" src="${process.env
				.URL_IMAGEN_AWS}${datosProducto[0].imagen}" />
			<p style="text-align: center; font-family: sans-serif;" ><span style="font-weight: bold;">Producto:</span> ${datosProducto[0]
				.nombre}</p>
			<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Cantidad:</span> ${cantidad}</p>
			${req.body.medida
				? req.body.medida[0].numero
					? `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Medida:</span> ${req
							.body.medida[0].numero}</p>`
					: `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Medida:</span> ${req
							.body.medida[0].talla}</p>`
				: ''}
			<div class="" style="margin-top: 20px; padding: 5px;">
				<p style="text-align: center; font-family: sans-serif;" > <span style="font-weight: bold;">Solicitud de:</span> ${clienteBase.nombre} ${clienteBase.apellido}</p>

				<p style="text-align: center; font-family: sans-serif;">Info del cliente:</p>
				<div  style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);transition: 0.3s; width: 200px; display:block; margin:auto;">

				${clienteBase.tipoSesion !== 'FireBase'
					? `<img style="max-width: 70px; display:block; margin:auto;" class="" src="${process.env
							.URL_IMAGEN_AWS}${clienteBase.imagen}"/>`
					: `<img style="max-width: 70px; display:block; margin:auto;" class="" src="${clienteBase.imagen}"/>`}

					<p style="text-align: center; font-family: sans-serif;font-size: 13px;" ><span style="font-weight: bold;">Correo:</span> ${clienteBase.email}</p>
					<p style="text-align: center; font-family: sans-serif;font-size: 13px;" ><span style="font-weight: bold;">Telefono:</span> ${clienteBase.telefono}</p>
					<p style="text-align: center; font-family: sans-serif;font-size: 13px;" ><span style="font-weight: bold;">Direccion:</span> ${clienteBase
						.direccion[0].calle_numero} Colonia ${clienteBase.direccion[0].colonia} ${clienteBase
		.direccion[0].ciudad} ${clienteBase.direccion[0].estado} ${clienteBase.direccion[0].pais}.</p>
				</div>
				<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Tipo de entrega:</span> ${tipoEntrega ===
				'ENVIO'
					? 'Envio a domicilio'
					: 'Recoger a sucursal'}</p>
			</div>
		</div>
		<p style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">El cliente espera que te contactes con el, Hazlo ya!!!</p>
	</div>
	`;

	const htmlContentUser = `
	<div>
		<div style="margin:auto; max-width: 550px; height: 100px;">
			${tienda[0].imagenLogo
				? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env
						.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`
				: ''} 
		</div>
		<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu apartado esta siendo <span style="color: #09ABF6;">procesado</span></h3>
		<h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Te pedimos que tengas paciencia, en breve se contactaran contigo para mas detalle.</h4>

		<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle del pedido:</h3>
		<div style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);transition: 0.3s; width: 350px; display:block; margin:auto;">
			<img style="max-width: 200px; display:block; margin:auto;" class="" src="${process.env
				.URL_IMAGEN_AWS}${datosProducto[0].imagen}" />
			<p style="text-align: center; font-family: sans-serif;" ><span style="font-weight: bold;">Producto:</span> ${datosProducto[0]
				.nombre}</p>
			<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Cantidad:</span> ${cantidad}</p>
			${req.body.medida
				? req.body.medida[0].numero
					? `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Medida:</span> ${req
							.body.medida[0].numero}</p>`
					: `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Medida:</span> ${req
							.body.medida[0].talla}</p>`
				: ''}
		</div>
	</div>
	`;

	email.sendEmail(admin[0].email, 'Solicitud de apartado', htmlContent, 'Cafi service');

	email.sendEmail(clienteBase.email, 'Apartado en proceso', htmlContentUser, tienda[0].nombre);
};

apartadoCtrl.createApartadoMultiple = async (req,res) => {
	try {
		console.log(req.body);
		const { cliente, tipoEntrega,apartadoMultiple } = req.body;
		const newApartado = new Apartado(req.body);
		newApartado.eliminado = false;
		const clienteBase = await clienteModel.findById(cliente);
		console.log(clienteBase);
		const admin = await adminModel.find({});
		const tienda = await Tienda.find();

		await newApartado.save();

		let pedidos = ``;
		let subTotal = 0;

		for(let i = 0; i < apartadoMultiple.length; i++){
			const product = await Producto.findById(apartadoMultiple[i].producto);
			subTotal += (parseFloat(apartadoMultiple[i].cantidad) * parseFloat(apartadoMultiple[i].precio));
			pedidos += `
			<tr>
				<td style="  padding: 15px; text-align: left;"><img style="max-width: 150px; display:block; margin:auto;" class="" src="${process.env.URL_IMAGEN_AWS}${product.imagen}" /></td>
				<td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;" > ${product.nombre}</p></td>
				<td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> ${apartadoMultiple[i].cantidad}</p></td>
				<td style="  padding: 15px; text-align: left;">
					${apartadoMultiple[i].medida? apartadoMultiple[i].medida.numero ? 
						`<p style="text-align: center; font-family: sans-serif;"> ${apartadoMultiple[i].medida.numero}</p>` : 
						`<p style="text-align: center; font-family: sans-serif;"> ${apartadoMultiple[i].medida.talla}</p>`:
						`<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">No aplica</span></p>`
					}
				</td>
				<td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> $ ${apartadoMultiple[i].precio}</p></td>
			</tr>
			`;
		}

		const htmlContent = `
		<div>
			<div style="margin:auto; max-width: 550px; height: 100px;;">
				${tienda[0].imagenLogo
					? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`
					: ''} 
			</div>
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tienes una nueva solicitud de apartado</h3>
			<div style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);transition: 0.3s; width: 350px; display:block; margin:auto;">
				<table style="display:block; margin:auto;">
					<tr>
						<td style="  padding: 15px; text-align: left;"><strong>Producto</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong></strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Cantidad</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Medida</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Precio</strong></td>
					</tr>
					${pedidos}
				</table>
				<h3 style=" margin:auto; margin-left: 360px;"><strong>Total: </strong>$ ${subTotal}</h3>
				<div class="" style="margin-top: 20px; padding: 5px;">
					<p style="text-align: center; font-family: sans-serif;" > <span style="font-weight: bold;">Solicitud de:</span> ${clienteBase.nombre} ${clienteBase.apellido}</p>
	
					<p style="text-align: center; font-family: sans-serif;">Info del cliente:</p>
					<div  style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);transition: 0.3s; width: 200px; display:block; margin:auto;">
	
					${clienteBase.tipoSesion !== 'FireBase'
						? `<img style="max-width: 70px; display:block; margin:auto;" class="" src="${process.env.URL_IMAGEN_AWS}${clienteBase.imagen}"/>`
						: `<img style="max-width: 70px; display:block; margin:auto;" class="" src="${clienteBase.imagen}"/>`}
	
						<p style="text-align: center; font-family: sans-serif;font-size: 13px;" ><span style="font-weight: bold;">Correo:</span> ${clienteBase.email}</p>
						<p style="text-align: center; font-family: sans-serif;font-size: 13px;" ><span style="font-weight: bold;">Telefono:</span> ${clienteBase.telefono}</p>
						<p style="text-align: center; font-family: sans-serif;font-size: 13px;" ><span style="font-weight: bold;">Direccion:</span> ${clienteBase.direccion[0].calle_numero} Colonia ${clienteBase.direccion[0].colonia} ${clienteBase.direccion[0].ciudad} ${clienteBase.direccion[0].estado} ${clienteBase.direccion[0].pais}.</p>
					</div>
					<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Tipo de entrega:</span> ${tipoEntrega === 'ENVIO'
						? 'Envio a domicilio'
						: 'Recoger a sucursal'}</p>
				</div>
			</div>
			<p style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">El cliente espera que te contactes con el, Hazlo ya!!!</p>
		</div>
		`;
	
		const htmlContentUser = `
		<div>
			<div style="margin:auto; max-width: 550px; height: 100px;">
				${tienda[0].imagenLogo
					? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`
					: ''} 
			</div>
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu apartado esta siendo <span style="color: #09ABF6;">procesado</span></h3>
			<h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Te pedimos que tengas paciencia, en breve se contactaran contigo para mas detalle.</h4>
	
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle del apartado:</h3>
			<div style="margin:auto; max-width: 550px;">
				<table style="display:block; margin:auto;">
					<tr>
						<td style="  padding: 15px; text-align: left;"><strong>Producto</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong></strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Cantidad</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Medida</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Precio</strong></td>
					</tr>
					${pedidos}
				</table>
				<h3 style=" margin:auto; margin-left: 360px;"><strong>Total: </strong>$ ${subTotal}</h3>
			</div>
		</div>
		`;
	
		email.sendEmail(admin[0].email, 'Solicitud de apartado', htmlContent, 'Cafi service');
	
		email.sendEmail(clienteBase.email, 'Apartado en proceso', htmlContentUser, tienda[0].nombre);

		await Carrito.findOneAndDelete({ cliente: clienteBase._id });

		res.status(200).json({ message: 'Apartado creado' });

	} catch (error) {
		res.status(500).json({ message: 'Hubo un error al obtener los apartados', error });
	}
}

apartadoCtrl.obtenerApartados = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const options = {
			page,
			limit: parseInt(limit)
		};

		const aggregate = Apartado.aggregate([
			{
				$lookup: {
					from: 'productos',
					localField: 'producto',
					foreignField: '_id',
					as: 'producto'
				}
			},
			{
				$lookup: {
					from: 'clientes',
					localField: 'cliente',
					foreignField: '_id',
					as: 'cliente'
				}
			},
			{
				$lookup: {
					from: 'productos',
					localField: 'apartadoMultiple.producto',
					foreignField: '_id',
					as: 'productosMultiple'
				}
			},
			{
				$match: {
					eliminado: false
				}
			}
		]).sort({ createdAt: -1 });

		await Apartado.aggregatePaginate(aggregate, options, (err, postStored) => {
			if (err) {
				res.status(500).json({ message: 'Error en el servidor', err });
			} else {
				if (!postStored) {
					res.status(404).json({ message: 'Error al mostrar Blogs' });
				} else {
					res.status(200).json({ posts: postStored });
				}
			}
		});
	} catch (error) {
		res.status(500).json({ message: 'Hubo un error al obtener los apartados', error });
	}
};

apartadoCtrl.obtenerApartado = async (req, res) => {
	try {
		await Apartado.aggregate([
			{
				$lookup: {
					from: 'promocions',
					localField: 'producto',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			},
			{
				$match: {
					_id: mongoose.Types.ObjectId(req.params.idApartado)
				}
			}
		]).exec(async function(err, transactions) {
			if (err) {
				res.send({ message: 'Error al obtener apartado', err });
			} else {
				await Apartado.populate(transactions, { path: 'cliente producto' }, function(
					err,
					populatedTransactions
				) {
					// Your populated translactions are inside populatedTransactions
					if (err) {
						res.send({ message: 'Error al obtener apartado', err });
					} else {
						res.json(populatedTransactions[0]);
					}
				});
			}
		});
	} catch (error) {
		res.status(500).json({ message: 'Hubo un error al obtener apartado', error });
	}
};

apartadoCtrl.obtenerApartadosCliente = async (req, res) => {
	try {
		await Apartado.aggregate([
			{
				$lookup: {
					from: 'promocions',
					localField: 'producto',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			},
			{
				$lookup: {
					from: 'productos',
					localField: 'apartadoMultiple.producto',
					foreignField: '_id',
					as: 'productosMultiple'
				}
			},
			{
				$match: {
					cliente: mongoose.Types.ObjectId(req.params.idCliente)
				}
			},
			{
				$match: {
					eliminado: false
				}
			}
		])
			.sort({ createdAt: -1 })
			.exec(async function(err, transactions) {
				if (err) {
					res.send({ message: 'Error al obtener apartado', err });
				} else {
					await Apartado.populate(transactions, { path: 'cliente producto' }, function(
						err,
						populatedTransactions
					) {
						// Your populated translactions are inside populatedTransactions
						if (err) {
							res.send({ message: 'Error al obtener apartado', err });
						} else {
							res.json(populatedTransactions);
						}
					});
				}
			});
	} catch (error) {
		res.status(500).json({ message: 'Hubo un error al obtener apartado', error });
	}
};

apartadoCtrl.filtroApartadosCliente = async (req, res) => {
	await Apartado.aggregate(
		[
			{
				$lookup: {
					from: 'productos',
					localField: 'producto',
					foreignField: '_id',
					as: 'producto'
				}
			},
			{
				$lookup: {
					from: 'clientes',
					localField: 'cliente',
					foreignField: '_id',
					as: 'cliente'
				}
			},
			{
				$match: {
					$or: [
						{ 'cliente.nombre': { $regex: '.*' + req.params.filter + '.*', $options: 'i' } },
						{ 'cliente.email': { $regex: '.*' + req.params.filter + '.*', $options: 'i' } },
						{ tipoEntrega: { $regex: '.*' + req.params.filter + '.*', $options: 'i' } },
						{ estado: { $regex: '.*' + req.params.filter + '.*', $options: 'i' } },
						{ paqueteria: { $regex: '.*' + req.params.filter + '.*', $options: 'i' } },
						{ fecha_envio: { $regex: '.*' + req.params.filter + '.*', $options: 'i' } },
						{ 'producto.nombre': { $regex: '.*' + req.params.filter + '.*', $options: 'i' } }
					]
				}
			},
			{
				$match: {
					eliminado: false
				}
			}
		],
		(err, postStored) => {
			if (err) {
				res.status(500).json({ message: 'Error en el servidor', err });
			} else {
				if (!postStored) {
					res.status(404).json({ message: 'Error al mostrar Productos' });
				} else {
					res.status(200).json(postStored);
				}
			}
		}
	);
};

async function actualizarApartadoMultiple(apartadoMultiple,action) {
	apartadoMultiple.map(async (apartado) => {
		const productoApartado = await Producto.findById(apartado.producto);
		const newProducto = productoApartado;
		if(productoApartado.tallas.length > 0){
			productoApartado.tallas.map(async (talla) => {
				if(talla.talla === apartado.medida.talla){
					let cantidadTotal;
					if(action === 1){
						cantidadTotal = parseInt(talla.cantidad) + parseInt(apartado.cantidad);
					}else{
						cantidadTotal = parseInt(talla.cantidad) - parseInt(apartado.cantidad);
					}
					await Producto.updateOne(
						{
							'tallas._id': talla._id
						},
						{
							$set: {
								'tallas.$': {
									talla: talla.talla,
									cantidad: cantidadTotal
								}
							}
						},
						async (err, response) => {
							if (err) {
								throw err;
							} else {
								if (!response) {
									throw err;
								} else {
									//console.log(apartado.producto);
									const productoNuevo = await Producto.findById(apartado.producto);
									let contador = 0;
									for (let i = 0; i < productoNuevo.tallas.length; i++) {
										contador += productoNuevo.tallas[i].cantidad;
									}
									if (contador === 0) {
										productoNuevo.activo = false;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}else{
										productoNuevo.activo = true;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}
								}
							}
						}
					);
				}
			})
		}else if(productoApartado.numeros.length > 0){
			productoApartado.numeros.map(async (numero) => {
				if(numero.numero === apartado.medida.numero){
					let cantidadTotal;
					if(action === 1){
						cantidadTotal = parseInt(numero.cantidad) + parseInt(apartado.cantidad);
					}else{
						cantidadTotal = parseInt(numero.cantidad) - parseInt(apartado.cantidad);
					}
					await Producto.updateOne(
						{
							'numeros._id': numero._id
						},
						{
							$set: {
								'numeros.$': {
									numero: numero.numero,
									cantidad: cantidadTotal
								}
							}
						},
						async (err, response) => {
							if (err) {
								throw err;
							} else {
								if (!response) {
									throw err;
								} else {
									const productoNuevo = await Producto.findById(apartado.producto);
									let contador = 0;
									for (let i = 0; i < productoNuevo.numeros.length; i++) {
										contador += productoNuevo.numeros[i].cantidad;
									}
									if (contador === 0) {
										productoNuevo.activo = false;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}else{
										productoNuevo.activo = true;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}
								}
							}
						}
					);
				}
			})
		}else{
			console.log(productoApartado);
			let cantidadTotal;
			if(action === 1){
				cantidadTotal = parseInt(productoApartado.cantidad) + parseInt(apartado.cantidad);
			}else{
				cantidadTotal = parseInt(productoApartado.cantidad) - parseInt(apartado.cantidad);
			}
			newProducto.cantidad = cantidadTotal;
			await Producto.findByIdAndUpdate(productoApartado._id, newProducto, async (err, userStored) => {
				if (err) {
					throw userStored;
				} else {
					if (!userStored) {
						throw userStored;
					} else {
						const productoNuevo = await Producto.findById(productoApartado._id);
						if (productoNuevo.cantidad === 0) {
							productoNuevo.activo = false;
							await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
						}else{
							productoNuevo.activo = true;
							await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
						}
					}
				}
			});
		}
	})
}

apartadoCtrl.actualizarApartado = async (req, res) => {
	const apatadoActualizado = req.body;
	
	apatadoActualizado.fecha_envio = new Date();
	const apartadoBase = await Apartado.findById(req.params.idApartado).populate('producto cliente').populate({ path: 'apartadoMultiple.producto',model: 'producto'});
	const tienda = await Tienda.find();

	await Apartado.findOneAndUpdate({ _id: req.params.idApartado }, apatadoActualizado, (err, response) => {
		if (err) {
			res.status(500).json({ message: 'Hubo un error al actualizar el apartado', err });
		} else {
			if (!response) {
				res.status(404).json({ message: 'Apartado no encontrado' });
			} else {
				res.status(200).json({ message: 'Apartado Actualizado', response });
			}
		}
	});
	let color = '';
	let mensaje = '';
	const producto = await Producto.findById(apartadoBase.producto);
	const newProducto = producto;
	switch (apatadoActualizado.estado) {
		case 'ACEPTADO':
			color = '#10B42B';
			mensaje = 'Tu apartado fue aceptado, puedes pasar por el a la sucursal.';
			if(apartadoBase.apartadoMultiple.length > 0){	
				actualizarApartadoMultiple(apartadoBase.apartadoMultiple,0);
			}else{
				if (apartadoBase.medida.length === 0) {
					/* console.log('no hay medida'); */
					if (producto.cantidad == 0 || producto.cantidad < apartadoBase.cantidad) {
						res.status(500).send({ message: 'No existen suficientes en el inventario' });
						throw error;
					} else {
						newProducto.cantidad = parseInt(producto.cantidad) - parseInt(apartadoBase.cantidad);
						await Producto.findByIdAndUpdate(apartadoBase.producto, newProducto, async (err, userStored) => {
							if (err) {
								throw userStored;
							} else {
								if (!userStored) {
									throw userStored;
								} else {
									const productoNuevo = await Producto.findById(apartadoBase.producto);
									console.log(productoNuevo.cantidad);
									if (productoNuevo.cantidad === 0) {
										productoNuevo.activo = false;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}
								}
							}
						});
					}
				} else {
					/* console.log('hay medida'); */
					if (apartadoBase.medida[0].numero) {
						/* console.log('y es numero'); */
						producto.numeros.map(async (numero) => {
							if (numero.numero == apartadoBase.medida[0].numero) {
								if (numero.cantidad == '0' || numero.cantidad < apartadoBase.cantidad) {
									res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
									throw numero.cantidad;
								} else {
									let cantidad = numero.cantidad - apartadoBase.cantidad;
									await Producto.updateOne(
										{
											'numeros._id': numero._id
										},
										{
											$set: {
												'numeros.$': {
													numero: numero.numero,
													cantidad: cantidad
												}
											}
										},
										async (err, response) => {
											if (err) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												if (!response) {
													res.status(500).send({ message: 'Ups algo paso al restar la talla' });
													throw err;
												} else {
													const productoNuevo = await Producto.findById(apartadoBase.producto);
													let contador = 0;
													for (let i = 0; i < productoNuevo.numeros.length; i++) {
														contador += productoNuevo.numeros[i].cantidad;
													}
													console.log(contador);
													if (contador === 0) {
														productoNuevo.activo = false;
														await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
													}
												}
											}
										}
									);
								}
							}
						});
					} else {
						/* console.log('y es talla'); */
						producto.tallas.map(async (talla) => {
							if (talla.talla == apartadoBase.medida[0].talla) {
								if (talla.cantidad == '0' || talla.cantidad < apartadoBase.cantidad) {
									res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
									throw talla.cantidad;
								} else {
									let cantidad = talla.cantidad - apartadoBase.cantidad;
									await Producto.updateOne(
										{
											'tallas._id': talla._id
										},
										{
											$set: {
												'tallas.$': {
													talla: talla.talla,
													cantidad: cantidad
												}
											}
										},
										async (err, response) => {
											if (err) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												if (!response) {
													res.status(500).send({ message: 'Ups algo paso al restar la talla' });
													throw err;
												} else {
													const productoNuevo = await Producto.findById(apartadoBase.producto);
													let contador = 0;
													for (let i = 0; i < productoNuevo.tallas.length; i++) {
														contador += productoNuevo.tallas[i].cantidad;
													}
													console.log(contador);
													if (contador === 0) {
														productoNuevo.activo = false;
														await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
													}
												}
											}
										}
									);
								}
							}
						});
					}
				}
			}

			break;
		case 'RECHAZADO':
			color = '#F7401B';
			mensaje = 'Tu apartado fue rechazado, puedes ponete en contacto para mas detalle.';
			if (apartadoBase.estado === 'ACEPTADO' || apartadoBase.estado === 'ENVIADO') {
				if(apartadoBase.apartadoMultiple.length > 0){
					actualizarApartadoMultiple(apartadoBase.apartadoMultiple,1);
				}else{
					if (apartadoBase.medida.length === 0) {
						/* console.log('no hay medida'); */
						newProducto.cantidad = parseInt(producto.cantidad) + parseInt(apartadoBase.cantidad);
						await Producto.findByIdAndUpdate(apartadoBase.producto, newProducto, async (err, userStored) => {
							if (err) {
								throw userStored;
							} else {
								if (!userStored) {
									throw userStored;
								} else {
									const productoNuevo = await Producto.findById(apartadoBase.producto);
									console.log(productoNuevo.cantidad);
									if (productoNuevo.cantidad === 0) {
										productoNuevo.activo = false;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}
								}
							}
						});
					} else {
						/* console.log('hay medida'); */
						if (apartadoBase.medida[0].numero) {
							/* console.log('y es numero'); */
							producto.numeros.map(async (numero) => {
								if (numero.numero == apartadoBase.medida[0].numero) {
									let cantidad = numero.cantidad + apartadoBase.cantidad;
									await Producto.updateOne(
										{
											'numeros._id': numero._id
										},
										{
											$set: {
												'numeros.$': {
													numero: numero.numero,
													cantidad: cantidad
												}
											}
										},
										async (err, response) => {
											if (err) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												if (!response) {
													res.status(500).send({ message: 'Ups algo paso al restar la talla' });
													throw err;
												} else {
													const productoNuevo = await Producto.findById(apartadoBase.producto);
													let contador = 0;
													for (let i = 0; i < productoNuevo.numeros.length; i++) {
														contador += productoNuevo.numeros[i].cantidad;
													}
													console.log(contador);
													if (contador === 0) {
														productoNuevo.activo = false;
														await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
													}
												}
											}
										}
									);
								}
							});
						} else {
							/* console.log('y es talla'); */
							producto.tallas.map(async (talla) => {
								if (talla.talla == apartadoBase.medida[0].talla) {
									let cantidad = talla.cantidad + apartadoBase.cantidad;
									await Producto.updateOne(
										{
											'tallas._id': talla._id
										},
										{
											$set: {
												'tallas.$': {
													talla: talla.talla,
													cantidad: cantidad
												}
											}
										},
										async (err, response) => {
											if (err) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												if (!response) {
													res.status(500).send({ message: 'Ups algo paso al restar la talla' });
													throw err;
												} else {
													const productoNuevo = await Producto.findById(apartadoBase.producto);
													let contador = 0;
													for (let i = 0; i < productoNuevo.tallas.length; i++) {
														contador += productoNuevo.tallas[i].cantidad;
													}
													console.log(contador);
													if (contador === 0) {
														productoNuevo.activo = false;
														await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
													}
												}
											}
										}
									);
								}
							});
						}
					}
				}

			}
			break;
		case 'ENVIADO':
			color = '#10B42B';
			mensaje = 'Tu apartado fue aceptado, tu apartado ya esta en camino, esperalo pronto.';
			/* 			const producto = await Producto.findById(apartadoBase.producto);
			const newProducto = producto; */
			if(apartadoBase.apartadoMultiple.length > 0){
				actualizarApartadoMultiple(apartadoBase.apartadoMultiple,0);
			}else{
				if (apartadoBase.medida.length === 0) {
					/* console.log('no hay medida'); */
					if (producto.cantidad == 0 || producto.cantidad < apartadoBase.cantidad) {
						res.status(500).send({ message: 'No existen suficientes en el inventario' });
						throw error;
					} else {
						newProducto.cantidad = parseInt(producto.cantidad) - parseInt(apartadoBase.cantidad);
						await Producto.findByIdAndUpdate(apartadoBase.producto, newProducto, async (err, userStored) => {
							if (err) {
								throw userStored;
							} else {
								if (!userStored) {
									throw userStored;
								} else {
									const productoNuevo = await Producto.findById(apartadoBase.producto);
									console.log(productoNuevo.cantidad);
									if (productoNuevo.cantidad === 0) {
										productoNuevo.activo = false;
										await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
									}
								}
							}
						});
					}
				} else {
					/* console.log('hay medida'); */
					if (apartadoBase.medida[0].numero) {
						/* console.log('y es numero'); */
						producto.numeros.map(async (numero) => {
							if (numero.numero == apartadoBase.medida[0].numero) {
								if (numero.cantidad == '0' || numero.cantidad < apartadoBase.cantidad) {
									res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
									throw numero.cantidad;
								} else {
									let cantidad = numero.cantidad - apartadoBase.cantidad;
									await Producto.updateOne(
										{
											'numeros._id': numero._id
										},
										{
											$set: {
												'numeros.$': {
													numero: numero.numero,
													cantidad: cantidad
												}
											}
										},
										async (err, response) => {
											if (err) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												if (!response) {
													res.status(500).send({ message: 'Ups algo paso al restar la talla' });
													throw err;
												} else {
													const productoNuevo = await Producto.findById(apartadoBase.producto);
													let contador = 0;
													for (let i = 0; i < productoNuevo.numeros.length; i++) {
														contador += productoNuevo.numeros[i].cantidad;
													}
													console.log(contador);
													if (contador === 0) {
														productoNuevo.activo = false;
														await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
													}
												}
											}
										}
									);
								}
							}
						});
					} else {
						/* console.log('y es talla'); */
						producto.tallas.map(async (talla) => {
							if (talla.talla == apartadoBase.medida[0].talla) {
								if (talla.cantidad == '0' || talla.cantidad < apartadoBase.cantidad) {
									res.status(500).send({ message: 'No existen suficientes productos en el inventario' });
									throw talla.cantidad;
								} else {
									let cantidad = talla.cantidad - apartadoBase.cantidad;
									await Producto.updateOne(
										{
											'tallas._id': talla._id
										},
										{
											$set: {
												'tallas.$': {
													talla: talla.talla,
													cantidad: cantidad
												}
											}
										},
										async (err, response) => {
											if (err) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												if (!response) {
													res.status(500).send({ message: 'Ups algo paso al restar la talla' });
													throw err;
												} else {
													const productoNuevo = await Producto.findById(apartadoBase.producto);
													let contador = 0;
													for (let i = 0; i < productoNuevo.tallas.length; i++) {
														contador += productoNuevo.tallas[i].cantidad;
													}
													console.log(contador);
													if (contador === 0) {
														productoNuevo.activo = false;
														await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
													}
												}
											}
										}
									);
								}
							}
						});
					}
				}
			}

			break;
		case 'CANCELADO':
			color = '#F7401B';
			mensaje = 'Tu apartado fue rechazado, puedes ponete en contacto para mas detalle.';
			if (apartadoBase.estado === 'ACEPTADO' || apartadoBase.estado === 'ENVIADO') {
				if(apartadoBase.apartadoMultiple.length > 0){
					actualizarApartadoMultiple(apartadoBase.apartadoMultiple,1);
				}
				if (apartadoBase.medida.length === 0) {
					/* console.log('no hay medida'); */
					newProducto.cantidad = parseInt(producto.cantidad) + parseInt(apartadoBase.cantidad);
					await Producto.findByIdAndUpdate(apartadoBase.producto, newProducto, async (err, userStored) => {
						if (err) {
							throw userStored;
						} else {
							if (!userStored) {
								throw userStored;
							} else {
								const productoNuevo = await Producto.findById(apartadoBase.producto);
								console.log(productoNuevo.cantidad);
								if (productoNuevo.cantidad === 0) {
									productoNuevo.activo = false;
									await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
								}
							}
						}
					});
				} else {
					/* console.log('hay medida'); */
					if (apartadoBase.medida[0].numero) {
						/* console.log('y es numero'); */
						producto.numeros.map(async (numero) => {
							if (numero.numero == apartadoBase.medida[0].numero) {
								let cantidad = numero.cantidad + apartadoBase.cantidad;
								await Producto.updateOne(
									{
										'numeros._id': numero._id
									},
									{
										$set: {
											'numeros.$': {
												numero: numero.numero,
												cantidad: cantidad
											}
										}
									},
									async (err, response) => {
										if (err) {
											res.status(500).send({ message: 'Ups algo paso al restar la talla' });
											throw err;
										} else {
											if (!response) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												const productoNuevo = await Producto.findById(apartadoBase.producto);
												let contador = 0;
												for (let i = 0; i < productoNuevo.numeros.length; i++) {
													contador += productoNuevo.numeros[i].cantidad;
												}
												console.log(contador);
												if (contador === 0) {
													productoNuevo.activo = false;
													await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
												}
											}
										}
									}
								);
							}
						});
					} else {
						/* console.log('y es talla'); */
						producto.tallas.map(async (talla) => {
							if (talla.talla == apartadoBase.medida[0].talla) {
								let cantidad = talla.cantidad + apartadoBase.cantidad;
								await Producto.updateOne(
									{
										'tallas._id': talla._id
									},
									{
										$set: {
											'tallas.$': {
												talla: talla.talla,
												cantidad: cantidad
											}
										}
									},
									async (err, response) => {
										if (err) {
											res.status(500).send({ message: 'Ups algo paso al restar la talla' });
											throw err;
										} else {
											if (!response) {
												res.status(500).send({ message: 'Ups algo paso al restar la talla' });
												throw err;
											} else {
												const productoNuevo = await Producto.findById(apartadoBase.producto);
												let contador = 0;
												for (let i = 0; i < productoNuevo.tallas.length; i++) {
													contador += productoNuevo.tallas[i].cantidad;
												}
												console.log(contador);
												if (contador === 0) {
													productoNuevo.activo = false;
													await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
												}
											}
										}
									}
								);
							}
						});
					}
				}
			}
			break;
		case 'ENTREGADO':
			color = '#10B42B';
			mensaje = 'Tu apartado fue entregado, gracias por confiar en nosotros.';
			break;
		default:
			break;
	}

	if(apartadoBase.apartadoMultiple.length){
		let pedidos = ``;
		let subTotal = 0;
		for(let i = 0; i < apartadoMultiple.length; i++){
			const product = await Producto.findById(apartadoMultiple[i].producto);
			subTotal += (parseFloat(apartadoMultiple[i].cantidad) * parseFloat(apartadoMultiple[i].precio));
			pedidos += `
			<tr>
				<td style="  padding: 15px; text-align: left;"><img style="max-width: 150px; display:block; margin:auto;" class="" src="${process.env.URL_IMAGEN_AWS}${product.imagen}" /></td>
				<td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;" > ${product.nombre}</p></td>
				<td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> ${apartadoMultiple[i].cantidad}</p></td>
				<td style="  padding: 15px; text-align: left;">
					${apartadoMultiple[i].medida? apartadoMultiple[i].medida.numero ? 
						`<p style="text-align: center; font-family: sans-serif;"> ${apartadoMultiple[i].medida.numero}</p>` : 
						`<p style="text-align: center; font-family: sans-serif;"> ${apartadoMultiple[i].medida.talla}</p>`:
						`<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">No aplica</span></p>`
					}
				</td>
				<td style="  padding: 15px; text-align: left;"><p style="text-align: center; font-family: sans-serif;"> $ ${apartadoMultiple[i].precio}</p></td>
			</tr>
			`;
		}
		const htmlContentUser = `
		<div>
			<div style="margin:auto; max-width: 550px; height: 100px;">
				${tienda[0].imagenLogo
					? `<img style="max-width: 200px; display:block; margin:auto; padding: 10px 0px;" src="${process.env.URL_IMAGEN_AWS}${tienda[0].imagenLogo}" />`
					: ''} 
			</div>
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu apartado a sido: <span style="color: ${color};">${apatadoActualizado.estado}</span></h3>
			<h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">${mensaje}</h4>
	
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle del apartado:</h3>
			<div style="margin:auto; max-width: 550px;">
				<table style="display:block; margin:auto;">
					<tr>
						<td style="  padding: 15px; text-align: left;"><strong>Producto</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong></strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Cantidad</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Medida</strong></td>
						<td style="  padding: 15px; text-align: left;"><strong>Precio</strong></td>
					</tr>
					${pedidos}
				</table>
				<h3 style=" margin:auto; margin-left: 360px;"><strong>Total: </strong>$ ${subTotal}</h3>
			</div>
		</div>
		`;
		email.sendEmail(
			apartadoBase.cliente.email,
			`Apartado ${apatadoActualizado.estado}`,
			htmlContentUser,
			tienda[0].nombre
		);
	}else{
		const htmlContentUser = `
		<div>
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">Tu apartado a sido: <span style="color: ${color};">${apatadoActualizado.estado}</span></h3>
			<h4 style="text-align: center;  font-family: sans-serif; margin: 15px 15px;">${mensaje}</h4>
	
			<h3 style="text-align: center;  font-family: sans-serif; margin: 15px 15px; font-weight: bold;">Detalle del pedido:</h3>
			<div style="box-shadow: 0 4px 8px 0 rgba(0,0,0,0.5);transition: 0.3s; width: 350px; display:block; margin:auto;">
				<img style="max-width: 200px; display:block; margin:auto;" class="" src="https://prueba-imagenes-uploads.s3.us-west-1.amazonaws.com/${apartadoBase.producto.imagen}" />
				<p style="text-align: center; font-family: sans-serif;" ><span style="font-weight: bold;">Producto:</span> ${apartadoBase.producto.nombre}</p>
				<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Cantidad:</span> ${apartadoBase.cantidad}</p>
				${apartadoBase.medida.length > 0
					? apartadoBase.medida[0].numero
						? `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Medida:</span> ${apartadoBase.medida[0].numero}</p>`
						: `<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Medida:</span> ${apartadoBase.medida[0].talla}</p>`
					: ''}
	
				${apatadoActualizado.estado === 'ENVIADO'
					? `
				<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Paqueteria:</span> ${apatadoActualizado.paqueteria}</p>
				<p style="text-align: center; font-family: sans-serif;"><span style="font-weight: bold;">Numero de seguimiento:</span> ${apatadoActualizado.codigo_seguimiento}</p>
				`
					: ''}
			</div>
		</div>
		`;
		email.sendEmail(
			apartadoBase.cliente.email,
			`Apartado ${apatadoActualizado.estado}`,
			htmlContentUser,
			tienda[0].nombre
		);
	}
};

apartadoCtrl.eliminarApartado = async (req, res) => {
	await Apartado.findOneAndDelete({ _id: req.params.idApartado }, (err, response) => {
		if (err) {
			res.status(500).json({ message: 'Hubo un error al eliminar apartado', err });
		} else if (!response) {
			res.status(404).json({ message: 'Apartado no encontrado' });
		} else {
			res.status(200).json({ message: 'Apartado eliminado' });
		}
	});
};

apartadoCtrl.obtenerUnApartado = async (req, res) => {
	try {
		const apartado = await Apartado.findById(req.params.id).populate('cliente').populate('producto');
		if (apartado) {
			res.status(200).json(apartado);
		}
	} catch (err) {
		res.status(500).json({ message: 'Hubo un error al obtener apartado', err });
	}
};

apartadoCtrl.eliminarApartadoCambiarEstado = async (req, res) => {
	console.log(req.params.idApartado);
	await Apartado.findOneAndUpdate({ _id: req.params.idApartado }, { eliminado: true }, (err, response) => {
		if (err) {
			res.status(500).json({ message: 'Hubo un error al actualizar el apartado', err });
		} else {
			if (!response) {
				res.status(404).json({ message: 'Apartado no encontrado' });
			} else {
				res.status(200).json({ message: 'Apartado Actualizado', response });
			}
		}
	});
};

module.exports = apartadoCtrl;
