const carritoCtrl = {};
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const mongoose = require('mongoose');

carritoCtrl.crearCarrito = async (req, res, next) => {
	/* console.log("llego a crear carrito")
	console.log(req.body) */
	const carrito = await Carrito.findOne({ cliente: req.params.idCliente });
	/* console.log(carrito) */
	if (!carrito) {
		const { cliente, articulos: [ { idarticulo, cantidad, medida: [ { talla, numero } ] } ] } = req.body;
		const articulos = await Producto.aggregate([
			{
				$lookup: {
					from: 'promocions',
					localField: '_id',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			},
			{
				$match: {
					_id: mongoose.Types.ObjectId(idarticulo)
				}
			}
		]);
		/* console.log(articulos) */
		articulos.map(async (productos) => {
			if (!talla && !numero) {
				if (cantidad > productos.cantidad) {
					res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock' });
				} else {
					if (productos.promocion.length) {
						var precio = productos.promocion[0].precioPromocion;
					} else {
						var precio = productos.precio;
					}
					const subtotal = precio * cantidad;
					const newCarrito = new Carrito({
						cliente,
						articulos: [ { idarticulo, cantidad, subtotal } ]
					});

					await newCarrito.save((err, response) => {
						if (err) {
							res.status(500).json({ messege: 'Hubo un error al crear el Carrito', err });
						} else {
							if (!response) {
								res.status(404).json({ message: 'Error al crear el Carrito' });
							} else {
								res.status(200).json({ message: 'Carrito creado', response });
							}
						}
					});
				}
			} else {
				if (!productos.numeros.length) {
					productos.tallas.map(async (tallas) => {
						if (talla === tallas.talla && cantidad > tallas.cantidad) {
							res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock' });
						} else if (talla === tallas.talla && cantidad <= tallas.cantidad) {
							if (productos.promocion.length) {
								var precio = productos.promocion[0].precioPromocion;
							} else {
								var precio = productos.precio;
							}
							/* const precio = productos.precio; */
							const subtotal = precio * cantidad;
							const newCarrito = new Carrito({
								cliente,
								articulos: [ { idarticulo, cantidad, medida: [ { talla } ], subtotal } ]
							});

							await newCarrito.save((err, response) => {
								if (err) {
									res.status(500).json({ messege: 'Hubo un error al crear el Carrito', err });
								} else {
									res.status(200).json({ message: 'Carrito creado', response });
								}
							});
						} else {
							res.status(404).json({ messege: 'La talla no existe' });
						}
					});
				} else if (!productos.tallas.length) {
					productos.numeros.map(async (numeros) => {
						if (numero === numeros.numero && cantidad > numeros.cantidad) {
							res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock ' });
						} else if (numero === numeros.numero && cantidad <= numeros.cantidad) {
							if (productos.promocion.length) {
								/* console.log('hay promocion'); */
								var precio = productos.promocion[0].precioPromocion;
							} else {
								/* console.log('no hay promocion'); */
								var precio = productos.precio;
							}
							/* console.log(precio); */
							/* const precio = productos.precio; */
							const subtotal = precio * cantidad;
							const newCarrito = new Carrito({
								cliente,
								articulos: [ { idarticulo, cantidad, medida: [ { numero } ], subtotal } ]
							});

							await newCarrito.save((err, response) => {
								if (err) {
									res.status(500).json({ messege: 'Hubo un error al crear el Carrito', err });
								} else {
									res.status(200).json({ message: 'Carrito creado', response });
								}
							});
						} else {
							res.status(404).json({ messege: 'El numero no existe' });
						}
					});
				}
			}
		});
	} else {
		next();
	}
};

carritoCtrl.eliminarAntesDeObtener = async (req, res, next) => {
	try {
		const carrito = await Carrito.findOne({ cliente: req.params.idCliente }).populate('articulos.idarticulo');

		carrito.articulos.map(async (articulo, index) => {
			if (articulo.idarticulo.eliminado && articulo.idarticulo.eliminado === true) {
				await Carrito.updateOne(
					{
						cliente: req.params.idCliente
					},
					{ $pull: { articulos: { _id: articulo._id } } },
					(err, response) => {
						if (response && index + 1 === carrito.articulos.length) {
							setTimeout(() => {
								next();
							}, 1000);
						}
					}
				);
			}
		});
		setTimeout(() => {
			next();
		}, 1000);
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener carrito', error });
	}
};

carritoCtrl.obtenerCarrito = async (req, res) => {
	try {
		await Carrito.aggregate([
			{
				$lookup: {
					from: 'promocions',
					localField: 'articulos.idarticulo',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			},
			{
				$match: {
					cliente: mongoose.Types.ObjectId(req.params.idCliente)
				}
			}
		]).exec(async function(err, transactions) {
			let nuevo_array = {};
			if (transactions.length > 0) {
				const { promocion, articulos } = transactions[0];

				nuevo_array = {
					_id: transactions[0]._id,
					cliente: transactions[0].cliente,
					articulos: []
				};
				const nuevo_array_articulos = articulos.map((articulos) => {
					const array_articulos = {
						_id: articulos._id,
						idarticulo: articulos.idarticulo,
						cantidad: articulos.cantidad,
						subtotal: articulos.subtotal,
						medida: articulos.medida
					};
					promocion.forEach((promocion) => {
						if (articulos.idarticulo.equals(promocion.productoPromocion)) {
							array_articulos.promocion = promocion;
						}
					});

					return array_articulos;
				});
				nuevo_array.articulos = nuevo_array_articulos;
				if (err) {
					res.send({ message: 'Error al obtener apartado', err });
				} else {
					const populatedTransactions = await Carrito.populate([ nuevo_array ], {
						path: 'cliente articulos.idarticulo'
					});
					res.status(200).json(populatedTransactions[0]);
				}
			} else {
				res.status(404).json({ mensaje: 'No hay datos en el carrito' });
			}
		});
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener carrito', error });
	}
};

/* carritoCtrl.obtenerCarrito = async (req, res) => {
	try {
		const carrito = await Carrito.findOne({ cliente: req.params.idCliente })
			.populate('cliente articulos.idarticulo');

		if (!carrito) {
			res.status(200).json([]);
		} else {
			res.status(200).json(carrito);
		}
	} catch (error) {
		res.status(500).json({ mensaje: 'Error al obtener carrito', error });
	}
}; */

carritoCtrl.agregarArticulo = async (req, res) => {
	/* console.log("llego a agregar articulo") */
	/* console.log(req.body); */
	const carrito = await Carrito.findOne({ cliente: req.params.idCliente });
	const { articulos: [ { idarticulo, cantidad, medida: [ { talla, numero } ] } ] } = req.body;
	const articulos = await Producto.aggregate([
		{
			$lookup: {
				from: 'promocions',
				localField: '_id',
				foreignField: 'productoPromocion',
				as: 'promocion'
			}
		},
		{
			$match: {
				_id: mongoose.Types.ObjectId(idarticulo)
			}
		}
	]);
	/* 	console.log(articulos) */
	articulos.map(async (productos) => {
		if (!talla && !numero) {
			console.log('es "otros"');
			if (cantidad > productos.cantidad) {
				res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock' });
			} else {
				if (productos.promocion.length) {
					var precio = productos.promocion[0].precioPromocion;
				} else {
					var precio = productos.precio;
				}
				/* const precio = productos.precio; */
				const subtotal = precio * cantidad;

				const existente = carrito.articulos.filter((articulo) => articulo.idarticulo.equals(idarticulo));

				if (existente.length !== 0) {
					/* console.log(idarticulo, cantidad); */
					/* console.log(existente[0]); */
					const nuevo_subtotal = existente[0].subtotal + subtotal;
					const nueva_cantidad = existente[0].cantidad + cantidad;
					await Carrito.updateOne(
						{
							'articulos._id': existente[0]._id
						},
						{
							$set: { 'articulos.$': { idarticulo, cantidad: nueva_cantidad, subtotal: nuevo_subtotal } }
						},
						(err, response) => {
							if (err) {
								res.status(500).json({ message: 'Hubo un error al agregar articulo', err });
							} else {
								if (!response) {
									res.status(404).json({ message: 'Error al crear el articulo' });
								} else {
									res.status(200).json({ message: 'Articulo agregado', response });
								}
							}
						}
					);
				} else {
					await Carrito.updateOne(
						{
							_id: carrito._id
						},
						{
							$addToSet: {
								articulos: [
									{
										idarticulo,
										cantidad,
										subtotal
									}
								]
							}
						},
						(err, response) => {
							if (err) {
								res.status(500).json({ messege: 'Hubo un error al agregar articulo', err });
							} else {
								if (!response) {
									res.status(404).json({ message: 'Error al crear el articulo' });
								} else {
									res.status(200).json({ message: 'Articulo agregado', response });
								}
							}
						}
					);
				}
			}
		} else {
			if (!productos.numeros.length) {
				/* console.log('es "tallas"') */
				productos.tallas.map(async (tallas) => {
					if (talla === tallas.talla && cantidad > tallas.cantidad) {
						res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock' });
					} else if (talla === tallas.talla && cantidad <= tallas.cantidad) {
						if (productos.promocion.length) {
							var precio = productos.promocion[0].precioPromocion;
						} else {
							var precio = productos.precio;
						}
						/* const precio = productos.precio; */
						const subtotal = precio * cantidad;
						await Carrito.updateOne(
							{
								_id: carrito._id
							},
							{
								$addToSet: {
									articulos: [
										{
											idarticulo,
											cantidad,
											medida: [ { talla } ],
											subtotal
										}
									]
								}
							},
							(err, response) => {
								/* console.log(err)
								console.log(response) */
								if (err) {
									res.status(500).json({ messege: 'Hubo un error al agregar articulo', err });
								} else {
									if (!response) {
										res.status(404).json({ message: 'Error al crear el articulo' });
									} else {
										res.status(200).json({ message: 'Articulo agregado', response });
									}
								}
							}
						);
					}
				});
			} else if (!productos.tallas.length) {
				/* console.log('es "numeros"') */
				productos.numeros.map(async (numeros) => {
					if (numero === numeros.numero && cantidad > numeros.cantidad) {
						res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock' });
					} else if (numero === numeros.numero && cantidad <= numeros.cantidad) {
						if (productos.promocion.length) {
							var precio = productos.promocion[0].precioPromocion;
						} else {
							var precio = productos.precio;
						}
						/* const precio = productos.precio; */
						const subtotal = precio * cantidad;
						await Carrito.updateOne(
							{
								_id: carrito._id
							},
							{
								$addToSet: {
									articulos: [
										{
											idarticulo,
											cantidad,
											medida: [ { numero } ],
											subtotal
										}
									]
								}
							},
							(err, response) => {
								/* console.log(err)
								console.log(response) */
								if (err) {
									res.status(500).json({ messege: 'Hubo un error al agregar articulo', err });
								} else {
									if (!response) {
										res.status(404).json({ message: 'Error al crear el articulo' });
									} else {
										res.status(200).json({ message: 'Articulo agregado', response });
									}
								}
							}
						);
					}
				});
			}
		}
	});
};

carritoCtrl.eliminarCarrito = async (req, res) => {
	await Carrito.findOneAndDelete({ cliente: req.params.idCliente }, (err, response) => {
		if (err) {
			res.status(500).json({ messege: 'hubo un error al eliminar el Carrito', err });
		} else {
			if (!response) {
				res.status(404).json({ message: 'Carrito no encontrado' });
			} else {
				res.status(200).json({ message: 'Carrito eliminado' });
			}
		}
	});
};

carritoCtrl.eliminarArticulo = async (req, res) => {
	await Carrito.updateOne(
		{
			cliente: req.params.idCliente
		},
		{ $pull: { articulos: { _id: req.params.idArticulo } } },
		(err, response) => {
			if (err) {
				res.status(500).json({ messege: 'Hubo un error al eliminar articulo', err });
			} else {
				if (!response) {
					res.status(404).json({ message: 'Articulo no encontrado' });
				} else {
					res.status(200).json({ message: 'Articulo eliminado' });
				}
			}
		}
	);
};

carritoCtrl.modificarCantidadArticulo = async (req, res) => {
	const { articulos } = await Carrito.findOne({ cliente: req.params.idCliente });
	const articuloFiltrado = articulos.filter((x) => x._id == req.params.idArticulo);

	articuloFiltrado.map(async (articulo) => {
		const idarticulo = articulo.idarticulo;
		const { cantidad, talla, numero } = req.body;
		const productos = await Producto.aggregate([
			{
				$lookup: {
					from: 'promocions',
					localField: '_id',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			},
			{
				$match: {
					_id: mongoose.Types.ObjectId(idarticulo)
				}
			}
		]);
		productos.map(async (productos) => {
			if (!articulo.medida.length) {
				console.log('otros');
				if (cantidad > productos.cantidad) {
					res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock' });
				} else {
					if (productos.promocion.length) {
						var precio = productos.promocion[0].precioPromocion;
					} else {
						var precio = productos.precio;
					}
					const subtotal = precio * cantidad;
					await Carrito.updateOne(
						{
							'articulos._id': req.params.idArticulo
						},
						{
							$set: { 'articulos.$': { idarticulo, cantidad, subtotal } }
						},
						(err, response) => {
							if (err) {
								res.status(500).json({ message: 'Hubo un error al actualizar la cantidad', err });
							} else {
								if (!response) {
									res.status(404).json({ message: 'Error al actualizar la cantidad' });
								} else {
									res
										.status(200)
										.json({ message: 'Sus cambios fueron realizados correctamente', response });
								}
							}
						}
					);
				}
			} else {
				console.log('es ropa o calzado');
				if (!articulo.medida[0].numero) {
					console.log('es talla');
					productos.tallas.map(async (tallas) => {
						if (talla === tallas.talla && cantidad > tallas.cantidad) {
							res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock (talla)' });
						} else if (talla === tallas.talla && cantidad <= tallas.cantidad) {
							if (productos.promocion.length) {
								var precio = productos.promocion[0].precioPromocion;
							} else {
								var precio = productos.precio;
							}
							const subtotal = precio * cantidad;
							await Carrito.updateOne(
								{
									'articulos._id': req.params.idArticulo
								},
								{
									$set: { 'articulos.$': { idarticulo, cantidad, medida: [ { talla } ], subtotal } }
								},
								(err, response) => {
									if (err) {
										res
											.status(500)
											.json({ message: 'Hubo un error al actualizar la medida o cantidad', err });
									} else {
										if (!response) {
											res
												.status(404)
												.json({ message: 'Error al modificar la medida o cantidad' });
										} else {
											res.status(200).json({ message: 'Se actualizo correctamente', response });
										}
									}
								}
							);
						}
					});
				} else if (!articulo.medida[0].talla) {
					console.log('es numero');
					productos.numeros.map(async (numeros) => {
						if (numero === numeros.numero && cantidad > numeros.cantidad) {
							res.status(404).json({ messege: 'Cantidad de articulos es mayor al stock (numero)' });
						} else if (numero === numeros.numero && cantidad <= numeros.cantidad) {
							if (productos.promocion.length) {
								var precio = productos.promocion[0].precioPromocion;
							} else {
								var precio = productos.precio;
							}
							const subtotal = precio * cantidad;
							await Carrito.updateOne(
								{
									'articulos._id': req.params.idArticulo
								},
								{
									$set: { 'articulos.$': { idarticulo, cantidad, medida: [ { numero } ], subtotal } }
								},
								(err, response) => {
									if (err) {
										res
											.status(500)
											.json({ message: 'Hubo un error al actualizar la medida o cantidad', err });
									} else {
										if (!response) {
											res
												.status(404)
												.json({ message: 'Error al modificar la medida o cantidad' });
										} else {
											res.status(200).json({ message: 'Se actualizo correctamente', response });
										}
									}
								}
							);
						}
					});
				}
			}
		});
	});
};

module.exports = carritoCtrl;
