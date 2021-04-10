const productosCtrl = {};
const imagen = require('./uploadFile.controllers');
const Producto = require('../models/Producto');
const promocionModel = require('../models/PromocionProducto');
const sugerenciaModel = require('../models/Sugerencia');
const galeriaModel = require('../models/Galeria');
const corouselModel = require('../models/Carousel');
const mongoose = require('mongoose');

productosCtrl.deleteImagen = async (req, res) => {
	try {
		const productoDeBase = await promocionModel.findById(req.params.id);
		if (productoDeBase.imagenPromocion) {
			await promocionModel.updateOne(
				{ _id: req.params.id },
				{ $unset: { imagenPromocion: '' } },
				async (err, userStored) => {
					if (err) {
						res.status(500).json({ message: 'Ups, algo paso al eliminar la imagen', err });
					} else {
						if (!userStored) {
							res.status(404).json({ message: 'Error al eliminar la imagen' });
						} else {
							const promocionBase = await promocionModel.findById(userStored._id);
							res.status(200).json({ message: 'Imagen eliminada', promocionBase });
						}
					}
				}
			);
		} else {
			res.status(500).json({ message: 'Esta promocion no tiene imagen' });
		}
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
		console.log(err);
		res.json({ err });
	}
};

productosCtrl.getPromociones = async (req, res, next) => {
	try {
		const promociones = await promocionModel
			.find({ idPromocionMasiva: { $exists: false } })
			.populate('productoPromocion');
		res.status(200).json(promociones);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
		next();
	}
};

productosCtrl.getPromocionesPaginadas = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const options = {
			page,
			limit: parseInt(limit),
			populate: [ 'productoPromocion' ]
		};
		await promocionModel.paginate({}, options, (err, postStored) => {
			if (err) {
				res.status(500).json({ message: 'Error en el servidor', err });
			} else {
				if (!postStored) {
					res.status(404).json({ message: 'Error al mostrar promociones' });
				} else {
					res.status(200).json({ posts: postStored });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getPromocion = async (req, res, next) => {
	try {
		const promociones = await promocionModel.findById(req.params.id).populate('productoPromocion');
		res.status(200).json(promociones);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
		next();
	}
};

productosCtrl.getPromocionCarousel = async (req, res, next) => {
	try {
		/* 		await promocionModel.aggregate([ { $sample: { size: 10 } }, ]).exec(async function(err, transactions) {
			if(err){
				res.send({ message: 'Ups, algo paso al obtenero el pedidos', err });
			}else{
				await Producto.populate(transactions, {path: 'productoPromocion'}, function(err, populatedTransactions) {
					// Your populated translactions are inside populatedTransactions
					if(err){
						res.send({ message: 'Ups, algo paso al obtenero el pedidos', err });
					}else{
						console.log(populatedTransactions)
						res.json(populatedTransactions);
					}
				});
			}			
		}); */

		const promocion = await promocionModel
			.find({ imagenPromocion: { $exists: true } })
			.populate('productoPromocion')
			.limit(10);
		res.status(200).json(promocion);
		/* promocion.aggregate([ { $sample: { size: 10 } } ]) */
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
		next();
	}
};

productosCtrl.crearPromocion = async (req, res) => {
	try {
		const newPromocion = new promocionModel(req.body);
		if (req.file) {
			newPromocion.imagenPromocion = req.file.key;
		}
		await newPromocion.save((err, userStored) => {
			if (err) {
				res.status(500).json({ message: 'Ups, algo paso al crear la promocion', err });
			} else {
				if (!userStored) {
					res.status(404).json({ message: 'Error al crear la promocion' });
				} else {
					res.status(200).json({ message: 'Promocion creada', userStored });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.actualizarPromocion = async (req, res) => {
	try {
		const promocionBase = await promocionModel.findById(req.params.id);
		const newPromocion = req.body;
		if (req.file) {
			newPromocion.imagenPromocion = req.file.key;
			if (promocionBase.imagenPromocion) {
				await imagen.eliminarImagen(promocionBase.imagenPromocion);
			}
		} else {
			newPromocion.imagenPromocion = promocionBase.imagenPromocion;
		}
		await promocionModel.findByIdAndUpdate(req.params.id, newPromocion, async (err, userStored) => {
			if (err) {
				res.status(500).json({ message: 'Ups, algo paso al crear al actualizar la promocion', err });
			} else {
				if (!userStored) {
					res.status(404).json({ message: 'Error al actualizar promocion' });
				} else {
					const promocionBase = await promocionModel.findById(userStored._id);
					res.status(200).json({ message: 'Promocion actualizada', promocionBase });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.eliminarPromocion = async (req, res) => {
	try {
		const promocionBase = await promocionModel.findById(req.params.id);
		if (promocionBase) {
			if (promocionBase.imagenPromocion) {
				await imagen.eliminarImagen(promocionBase.imagenPromocion);
			}

			const promocion = await promocionModel.findByIdAndDelete(req.params.id);
			if (!promocion) {
				res.status(404).json({ message: 'Este promocion no existe' });
			}
			res.status(200).json({ message: 'Promocion eliminada' });
		} else {
			res.status(404).json({ message: 'Este promocion no existe' });
		}
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.actualizarNumero = async (req, res) => {
	try {
		const datos = await Producto.findById(req.params.id);
		const numerosProducto = datos.numeros;
		const numeros = numerosProducto.filter((x) => x._id == req.params.idnumero);
		numeros.map(async (numerosArray) => {
			console.log(req.body);
			const { numero = numerosArray.numero, cantidad = numerosArray.cantidad } = req.body;
			await Producto.updateOne(
				{
					'numeros._id': req.params.idnumero
				},
				{
					$set: { 'numeros.$': { numero, cantidad } }
				},
				async (err, response) => {
					if (err) {
						res.status(500).json({ message: 'Ups algo paso al actualizar', err });
					} else {
						if (!response) {
							res.status(404).json({ message: 'Este apartado no existe' });
						} else {
							res.status(200).json({ message: 'Se actualizo con exito' });
							const productoNuevo = await Producto.findById(req.params.id);
							let contador = 0;
							for (let i = 0; i < productoNuevo.numeros.length; i++) {
								contador += productoNuevo.numeros[i].cantidad;
							}
							if (contador > 0) {
								productoNuevo.activo = true;
								await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
							} else {
								productoNuevo.activo = false;
								await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
							}
						}
					}
				}
			);
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.actualizarTalla = async (req, res) => {
	try {
		const datos = await Producto.findById(req.params.id);
		const tallasProducto = datos.tallas;
		const tallas = tallasProducto.filter((x) => x._id == req.params.idtalla);
		tallas.map(async (tallaArray) => {
			console.log(req.body);
			const { talla = tallaArray.talla, cantidad = tallaArray.cantidad } = req.body;
			await Producto.updateOne(
				{
					'tallas._id': req.params.idtalla
				},
				{
					$set: { 'tallas.$': { talla, cantidad } }
				},
				async (err, response) => {
					if (err) {
						res.status(500).json({ message: 'Ups algo paso al actualizar', err });
					} else {
						if (!response) {
							res.status(404).json({ message: 'Este apartado no existe' });
						} else {
							res.status(200).json({ message: 'Se actualizo con exito' });
							const productoNuevo = await Producto.findById(req.params.id);
							let contador = 0;
							for (let i = 0; i < productoNuevo.tallas.length; i++) {
								contador += productoNuevo.tallas[i].cantidad;
							}
							if (contador > 0) {
								productoNuevo.activo = true;
								await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
							} else {
								productoNuevo.activo = false;
								await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
							}
						}
					}
				}
			);
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.eliminarTalla = async (req, res) => {
	try {
		await Producto.updateOne(
			{
				_id: req.params.id
			},
			{
				$pull: {
					tallas: {
						_id: req.params.idtalla
					}
				}
			},
			(err, response) => {
				if (err) {
					res.status(500).json({ message: 'Ups, also paso en la base', err });
				} else {
					if (!response) {
						res.status(404).json({ message: 'esa talla no existe' });
					} else {
						res.status(200).json({ message: 'Talla eliminada' });
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.eliminarNumero = async (req, res) => {
	try {
		await Producto.updateOne(
			{
				_id: req.params.id
			},
			{
				$pull: {
					numeros: {
						_id: req.params.idnumero
					}
				}
			},
			(err, response) => {
				if (err) {
					res.status(500).json({ message: 'Ups, also paso en la base', err });
				} else {
					if (!response) {
						res.status(404).json({ message: 'ese numero no existe' });
					} else {
						res.status(200).json({ message: 'Numero eliminada' });
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.addTalla = async (req, res, next) => {
	try {
		const { talla, cantidad } = req.body;
		console.log(req.body);
		await Producto.updateOne(
			{
				_id: req.params.id
			},
			{
				$addToSet: {
					tallas: [
						{
							talla: talla,
							cantidad: cantidad
						}
					]
				}
			},
			async (err, response) => {
				if (err) {
					res.status(500).json({ message: 'Ups, algo al guardar talla', err });
				} else {
					if (!response) {
						res.status(404).json({ message: 'Error al guardar' });
					} else {
						res.status(200).json({ message: 'talla guardada' });
						const productoNuevo = await Producto.findById(req.params.id);
						let contador = 0;
						for (let i = 0; i < productoNuevo.tallas.length; i++) {
							contador += productoNuevo.tallas[i].cantidad;
						}
						if (contador > 0) {
							productoNuevo.activo = true;
							await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
						} else {
							productoNuevo.activo = false;
							await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
						}
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.addnumero = async (req, res, next) => {
	try {
		const { numero, cantidad } = req.body;
		console.log(req.body);
		await Producto.updateOne(
			{
				_id: req.params.id
			},
			{
				$addToSet: {
					numeros: {
						numero: numero,
						cantidad: cantidad
					}
				}
			},
			async (err, response) => {
				if (err) {
					res.status(500).json({ message: 'Ups, algo al guardar numero', err });
				} else {
					if (!response) {
						res.status(404).json({ message: 'Error al guardar' });
					} else {
						res.status(200).json({ message: 'numero guardado' });
						const productoNuevo = await Producto.findById(req.params.id);
						let contador = 0;
						for (let i = 0; i < productoNuevo.numeros.length; i++) {
							contador += productoNuevo.numeros[i].cantidad;
						}
						if (contador > 0) {
							productoNuevo.activo = true;
							await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
						} else {
							productoNuevo.activo = false;
							await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
						}
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.subirImagen = (req, res, next) => {
	imagen.upload(req, res, function(err) {
		if (err) {
			res.status(500).json({ message: 'formato de imagen no valido', err });
		} else {
			return next();
		}
	});
};

/* productosCtrl.getProductos = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const options = {
			page,
			limit: parseInt(limit)
		}
		await Producto.paginate({}, options, (err, postStored) => {
			if (err) {
				res.status(500).json({  message: "Error en el servidor", err });
			} else {
				if (!postStored) {
					res.status(404).json({ message: "Error al mostrar Blogs" })
				} else {
					res.status(200).json({ posts: postStored });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })
	}
}; */

/* productosCtrl.getProductosFiltrados = async (req, res) => {
	try {
		await Producto.find({nombre: { $regex: '.*' + req.params.search + '.*', $options: 'i' } },(err, postStored) => {
			if (err) {
				res.status(500).json({  message: "Error en el servidor", err });
			} else {
				if (!postStored) {
					res.status(404).json({ message: "Error al mostrar Productos" })
				} else {
					res.status(200).json({ posts: postStored });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: "Error en el servidor",err })
	}
}; */

productosCtrl.getProductoSinPaginacion = async (req, res) => {
	try {
		await Producto.aggregate(
			[
				{
					$match: {
						$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
					}
				},
				{
					$lookup: {
						from: 'promocions',
						localField: '_id',
						foreignField: 'productoPromocion',
						as: 'promocion'
					}
				}
			],
			(err, response) => {
				if (err) {
					res.status(500).json({ message: 'Error en el servidor', err });
				} else {
					if (!response) {
						res.status(404).json({ message: 'Error al mostrar Productos' });
					} else {
						res.status(200).json(response);
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getProductosFiltrosDividos = async (req, res) => {
	try {
		const { categoria = '', subcategoria = '', genero = '', temporada = '' } = req.query;
		var match = {};

		if (categoria && !subcategoria && !genero && !temporada) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [ { categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } } ]
			};
		} else if (categoria && subcategoria && !genero && !temporada) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } }
				]
			};
		} else if (categoria && subcategoria && genero && !temporada) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } },
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } }
				]
			};
		} else if (categoria && subcategoria && genero && temporada) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } },
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
				]
			};
		} else if (categoria && !subcategoria && genero && !temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [ 
					{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } }
				]
			};
		} else if (categoria && subcategoria && !genero && temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } },
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
				]
			};
		} else if (categoria && !subcategoria && !genero && temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
				]
			};
		} else if (!categoria && subcategoria && !genero && !temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } }
				]
			};
		} else if (!categoria && subcategoria && genero && !temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } }
				]
			};
		} else if (!categoria && subcategoria && genero && temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } },
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } },

				]
			};
		} else if (!categoria && subcategoria && !genero && temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } },
					{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } }
				]
			};
		} else if (!categoria && !subcategoria && genero && !temporada ) {
			console.log("Entro genero");
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
				]
			};
		} else if (!categoria && !subcategoria && genero && temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
				]
			};
		} else if (!categoria && !subcategoria && !genero && temporada ) {
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
				$and: [
					{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } },
				]
			};
		}else{
			console.log("Entro");
			match = {
				$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
			};
		}

		await Producto.aggregate(
			[
				{
					$lookup: {
						from: 'promocions',
						localField: '_id',
						foreignField: 'productoPromocion',
						as: 'promocion'
					}
				},
				{ 
					$sort: { createdAt: -1 } 
				},
				{
					$match: match
				}
			],
			(err, postStored) => {
				if (err) {
					res.status(500).json({ message: 'Error en el servidor', err });
				} else {
					if (!postStored) {
						res.status(404).json({ message: 'Error al mostrar Productos' });
					} else {
						res.status(200).json({ posts: postStored });
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getProductosFiltroTemporada = async (req,res) => {
    try {
        const { temporada } = req.query;
        await Producto.aggregate(
			[
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
						$or: [
							{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
						],
						$and: [ { $or: [ { eliminado: { $exists: false } }, { eliminado: false } ] } ]
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
						res.status(200).json({ posts: postStored });
					}
				}
			}
		);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

productosCtrl.getProductosFiltrados = async (req, res) => {
	const { nombre, categoria, subcategoria, genero, color, temporada } = req.query;
	try {
		await Producto.aggregate(
			[
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
						$or: [
							{ nombre: { $regex: '.*' + nombre + '.*', $options: 'i' } },
							{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
							{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } },
							{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
							{ color: { $regex: '.*' + color + '.*', $options: 'i' } },
							{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
						],
						$and: [ { $or: [ { eliminado: { $exists: false } }, { eliminado: false } ] } ]
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
						res.status(200).json({ posts: postStored });
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getProductosFiltradosAdmin = async (req, res) => {
	const { codigo, nombre, categoria, subcategoria, genero, color , temporada} = req.query;
	try {
		await Producto.aggregate(
			[
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
						$or: [
							{ codigo: { $regex: '.*' + codigo + '.*', $options: 'i' } },
							{ nombre: { $regex: '.*' + nombre + '.*', $options: 'i' } },
							{ categoria: { $regex: '.*' + categoria + '.*', $options: 'i' } },
							{ subCategoria: { $regex: '.*' + subcategoria + '.*', $options: 'i' } },
							{ genero: { $regex: '.*' + genero + '.*', $options: 'i' } },
							{ color: { $regex: '.*' + color + '.*', $options: 'i' } },
							{ temporada: { $regex: '.*' + temporada + '.*', $options: 'i' } }
						],
						$and: [ { $or: [ { eliminado: { $exists: false } }, { eliminado: false } ] } ]
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
						res.status(200).json({ posts: postStored });
					}
				}
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getProductosIndividuales = async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;
		const options = {
			page,
			limit: parseInt(limit)
		};
		const aggregate = Producto.aggregate([
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
					tipoCategoria: req.query.tipoCategoria,
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			}
		]);

		await Producto.aggregatePaginate(aggregate, options, (err, postStored) => {
			if (err) {
				res.status(500).json({ message: 'Error en el servidor', err });
			} else {
				if (!postStored) {
					res.status(404).json({ message: 'Error al mostrar Productos' });
				} else {
					res.status(200).json({ posts: postStored });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getProductos = async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;
		const options = {
			page,
			limit: parseInt(limit)
		};
		const aggregate = Producto.aggregate([
			{
				$match: {
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			},
			{
				$lookup: {
					from: 'promocions',
					localField: '_id',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			}
		]);

		await Producto.aggregatePaginate(aggregate, options, (err, postStored) => {
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
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.getProducto = async (req, res, next) => {
	try {
		const producto = await Producto.aggregate([
			{
				$match: {
					_id: mongoose.Types.ObjectId(req.params.id),
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			},
			{
				$lookup: {
					from: 'promocions',
					localField: '_id',
					foreignField: 'productoPromocion',
					as: 'promocion'
				}
			}
		]);
		if (!producto) {
			res.status(404).json({ message: 'Este producto no existe' });
			return next();
		}
		res.status(200).json(producto[0]);
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.createProducto = async (req, res) => {
	try {
		console.log(req.body);
		const newProducto = new Producto(req.body);
		newProducto.activo = true;
		if (req.file) {
			newProducto.imagen = req.file.key;
		}
		await newProducto.save((err, userStored) => {
			if (err) {
				res.status(500).json({ message: 'Ups, algo paso al registrar el producto', err });
			} else {
				if (!userStored) {
					res.status(404).json({ message: 'Error al crear el producto' });
				} else {
					res.status(200).json({ message: 'Producto almacenado', userStored });
				}
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.updateProducto = async (req, res, next) => {
	try {
		const productoDeBase = await Producto.findById(req.params.id);
		console.log(req.body);
		//Construir nuevo producto
		const nuevoProducto = req.body;
		//Verificar si mandaron imagen
		if (req.file) {
			nuevoProducto.imagen = req.file.key;
			await imagen.eliminarImagen(productoDeBase.imagen);
		} else {
			nuevoProducto.imagen = productoDeBase.imagen;
		}

		/* if(productoDeBase.subCategoria !== nuevoProducto.subCategoria){
			await Producto.updateMany({subCategoria: productoDeBase.subCategoria},{$set:{subCategoria: nuevoProducto.subCategoria}},{multi:true});
		} */

		const producto = await Producto.findByIdAndUpdate(req.params.id, nuevoProducto);

		const productoNuevo = await Producto.findById(req.params.id);

		if (productoNuevo.tallas.length > 0) {
			let contador = 0;
			for (let i = 0; i < productoNuevo.tallas.length; i++) {
				contador += productoNuevo.tallas[i].cantidad;
			}
			if (contador > 0) {
				productoNuevo.activo = true;
				await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
			} else {
				productoNuevo.activo = false;
				await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
			}
		} else if (productoNuevo.numeros.length > 0) {
			console.log('entro a numero');
			let contador = 0;
			for (let i = 0; i < productoNuevo.numeros.length; i++) {
				contador += productoNuevo.numeros[i].cantidad;
			}
			console.log(contador);
			if (contador > 0) {
				productoNuevo.activo = true;
				await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
			} else {
				productoNuevo.activo = false;
				await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
			}
		} else {
			if (productoNuevo.cantidad > 0) {
				productoNuevo.activo = true;
				await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
			} else {
				productoNuevo.activo = false;
				await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
			}
		}
		res.status(200).json({ message: 'Producto actualizado', producto });
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
		console.log(err);
		next();
	}
};

productosCtrl.deleteProducto = async (req, res, next) => {
	try {
		const idProducto = req.params.id;
		const ProductoBase = await Producto.findById(idProducto);
		const newProducto = ProductoBase;
		
		newProducto.eliminado = true;

		await Producto.findByIdAndUpdate(idProducto,newProducto);

		const galeriaProducto = await galeriaModel.findOne({producto: idProducto});
		console.log(galeriaProducto);
		if(galeriaProducto){
			if(galeriaProducto.imagenes.length > 0){
				galeriaProducto.imagenes.map(async (imagenGaleria) => {
					await imagen.eliminarImagen(imagenGaleria.url);
				})
			}
			await galeriaModel.findByIdAndDelete(galeriaProducto._id);
		}

		const promocionProducto = await promocionModel.findOne({productoPromocion: idProducto})
		console.log(promocionProducto);
		if(promocionProducto){
			await promocionModel.findByIdAndDelete(promocionProducto._id);
		}

		const carouselProducto = await corouselModel.findOne({producto: idProducto});
		console.log(carouselProducto);
		if(carouselProducto){
			await corouselModel.findByIdAndDelete(carouselProducto._id);
		}

		const sugerenciaProducto = await sugerenciaModel.findOne({producto: idProducto});
		console.log(sugerenciaProducto);
		if(sugerenciaProducto){
			await sugerenciaModel.findByIdAndDelete(sugerenciaProducto._id);
		}

		const sugerenciaDesugerenciaProducto = await sugerenciaModel.findOne({'sugerencias.producto': idProducto});
		console.log(sugerenciaDesugerenciaProducto);
		if(sugerenciaDesugerenciaProducto){
			await sugerenciaModel.findByIdAndDelete(sugerenciaDesugerenciaProducto._id);
		}

		/* const carritoProducto = await carritoModel.find({'articulos.idarticulo': idProducto});
		console.log(carritoProducto);

		if(carritoProducto.length > 0){
			carritoProducto.map((carrito) => {
				if(carrito.articulos.length > 0){
					carrito.articulos.map(async (articulo) => {
						if(articulo.idarticulo.equals(idProducto)){
							await carritoModel.updateOne(
								{
									cliente: carrito.cliente
								},
								{ $pull: { articulos: { _id: articulo._id } } }
							);
						}
					});
				}
			})
		} */
		res.status(200).json({ message: 'Producto eliminado' });
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.generosAgrupados = async (req, res) => {
	try {
		const genero = await Producto.aggregate([
			{
				$match: {
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			},
			{
				$group: { _id: '$genero' }
			}
		]);
		res.status(200).json(genero);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.tipoCategoriasAgrupadas = async (req, res) => {
	try {
		const categorias = await Producto.aggregate([
			{
				$match: {
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			},
			{ $group: { _id: '$tipoCategoria' } }
		]).sort('_id');
		res.status(200).json(categorias);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.categoriasAgrupadas = async (req, res) => {
	try {
		await Producto.aggregate([
			{
				$match: {
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			},
			{ $group: { _id: '$categoria' } }
		],
		async function(err, categorias) {
			arrayCategorias = [];
			console.log(categorias);
			console.log(categorias.length);
			for (i = 0; i < categorias.length; i++) {
				if (categorias[i]._id !== null) {
					if (categorias[i]._id) {
					const tipoCategoriaBase = await Producto.aggregate(
							[
								{
									$match: {
										$or: [ { categoria: categorias[i]._id } ]
									}
								},
								{
									$group: { _id: '$tipoCategoria' }
								}
							],
							async function(err, tipoCategoriaBase) {
								return tipoCategoriaBase;
							}
						);
						arrayCategorias.push({
							_id: categorias[i]._id,
							tipoCategoria: tipoCategoriaBase[0]._id
						});
					}
				}
			}
			res.status(200).json(arrayCategorias);
			console.log(arrayCategorias);
		});
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.subCategorias = async (req, res) => {
	try {
		const subCategorias = await Producto.aggregate([
			{
				$match: {
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ],
					$and: [ { categoria: req.params.idCategoria } ]
				}
			},
			{
				$group: { _id: '$subCategoria' }
			}
		]);
		res.status(200).json(subCategorias);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.agruparTemporada = async (req,res) => {
	try {
		const temporada = await Producto.aggregate([
			{
				$match: {
					$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
				}
			},
			{ $group: { _id: '$temporada' } }
		]);
		res.status(200).json(temporada);
	} catch (error) {
		res.status(500).json({ message: 'Error en el servidor', error });
	}
}

productosCtrl.crecarFiltrosNavbar = async (req, res, next) => {
	try {
		await Producto.aggregate(
			[
				{
					$match: {
						$or: [ { eliminado: { $exists: false } }, { eliminado: false } ]
					}
				},
				{ $group: { _id: '$categoria' } }
			],
			async function(err, categorias) {
				arrayCategorias = [];
				console.log(categorias);
				console.log(categorias.length);
				for (i = 0; i < categorias.length; i++) {
					if (categorias[i]._id !== null) {
						if (categorias[i]._id) {
						const subCategoriasBase =await Producto.aggregate(
								[
									{
										$match: {
											$or: [ { categoria: categorias[i]._id } ]
										}
									},
									{
										$group: { _id: '$subCategoria' }
									}
								],
								async function(err, subCategoriasBase) {
									return subCategoriasBase;
								}
							);
							arrayCategorias.push({
								categoria: categorias[i]._id,
								subcCategoria: subCategoriasBase
							});
						}
					}

					/* if(categorias.length === (i + 1)){
                    res.status(200).json(arrayCategorias);
                } */
				}
				res.status(200).json(arrayCategorias);
				console.log(arrayCategorias);
				/* await categorias.forEach(async (item,index) => {
				arrayCategorias = []
				if(categorias.lenght === (index + 1) ){
					return arrayCategorias
				}else{
					if(item._id !== null){
						await Producto.aggregate([
						   {$match:
							   {
							   $or: [{categoria: item._id}],
							   }
						   },
						   {
							   $group: { _id: '$subCategoria'}
						   }
						   ],async function(err,subCategoriasBase){
							   arrayCategorias.push({
								   categoria: item._id,
								   subcCategoria: subCategoriasBase
							   });
						   });
					   }
				}
			});
			await sleep(3000)
			if(arrayCategorias.length !== 0){
				res.status(200).json(arrayCategorias);
			} else {
				res.status(200).json([]);
			} */
			}
		);
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.importacionExcel = async (req, res) => {
	try {
		const { data } = req.body;
		console.log(data);
		if (data.length) {
			data.map(async (producto) => {
				const existProduto = await Producto.find({ codigo: producto.Codigo_de_barras });
				if (existProduto) {
					await Producto.updateOne(
						{
							codigo: producto.Codigo_de_barras
						},
						{
							$set: { cantidad: producto.Cantidad }
						}
					);
				}
			});
			res.status(200).json({ message: 'Productos actualizados.' });
		} else {
			res.status(500).json({ message: 'Archivo no valido.', err });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

productosCtrl.actualizarInventario = async (req, res) => {
	try {
		const { cantidad, medida, accion } = req.body;
		const productoBD = await Producto.findById(req.params.id);
		if (productoBD.tipoCategoria === 'Calzado') {
			const numeros = productoBD.numeros.filter((numero) => numero._id == medida);
			if (!numeros.length) {
				res.status(500).json({ message: 'Esta talla no existe' });
			} else {
				numeros.map(async (numero) => {
					let nuevaCantidad;
					if (accion === 'sumar') {
						nuevaCantidad = numero.cantidad + cantidad;
					} else {
						nuevaCantidad = numero.cantidad - cantidad;
					}

					if (nuevaCantidad < 0) {
						res.status(404).json({ message: 'No puedes restar más de lo que hay actualmente' });
					} else {
						await Producto.updateOne(
							{
								'numeros._id': medida
							},
							{
								$set: { 'numeros.$': { numero: numero.numero, cantidad: nuevaCantidad } }
							},
							async (err, response) => {
								if (err) {
									res.status(500).json({ message: 'Ups algo paso al actualizar', err });
								} else {
									if (!response) {
										res.status(404).json({ message: 'Error al actualizar' });
									} else {
										res.status(200).json({ message: 'Se actualizo con exito' });
										const productoNuevo = await Producto.findById(req.params.id);
										let contador = 0;
										for (let i = 0; i < productoNuevo.numeros.length; i++) {
											contador += productoNuevo.numeros[i].cantidad;
										}
										if (contador > 0) {
											productoNuevo.activo = true;
											await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
										} else {
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
		} else if (productoBD.tipoCategoria === 'Ropa') {
			const tallas = productoBD.tallas.filter((talla) => talla._id == medida);
			if (!tallas.length) {
				res.status(500).json({ message: 'Esta talla no existe' });
			} else {
				tallas.map(async (talla) => {
					let nuevaCantidad;
					if (accion === 'sumar') {
						nuevaCantidad = talla.cantidad + cantidad;
					} else {
						nuevaCantidad = talla.cantidad - cantidad;
					}

					if (nuevaCantidad < 0) {
						res.status(404).json({ message: 'No puedes restar más de lo que hay actualmente' });
					} else {
						await Producto.updateOne(
							{
								'tallas._id': medida
							},
							{
								$set: { 'tallas.$': { talla: talla.talla, cantidad: nuevaCantidad } }
							},
							async (err, response) => {
								if (err) {
									res.status(500).json({ message: 'Ups algo paso al actualizar', err });
								} else {
									if (!response) {
										res.status(404).json({ message: 'Error al actualizar' });
									} else {
										res.status(200).json({ message: 'Se actualizo con exito' });
										const productoNuevo = await Producto.findById(req.params.id);
										let contador = 0;
										for (let i = 0; i < productoNuevo.tallas.length; i++) {
											contador += productoNuevo.tallas[i].cantidad;
										}
										if (contador > 0) {
											productoNuevo.activo = true;
											await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
										} else {
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
		} else {
			let nuevaCantidad;
			if (accion === 'sumar') {
				nuevaCantidad = productoBD.cantidad + cantidad;
			} else {
				nuevaCantidad = productoBD.cantidad - cantidad;
			}

			if (nuevaCantidad < 0) {
				res.status(404).json({ message: 'No puedes restar más de lo que hay actualmente' });
			} else {
				await Producto.updateOne(
					{
						_id: req.params.id
					},
					{
						$set: { cantidad: nuevaCantidad }
					},
					async (err, response) => {
						if (err) {
							res.status(500).json({ message: 'Ups algo paso al actualizar', err });
						} else {
							if (!response) {
								res.status(404).json({ message: 'Error al actualizar' });
							} else {
								res.status(200).json({ message: 'Se actualizo con exito' });
								const productoNuevo = await Producto.findById(req.params.id);
								if (productoNuevo.cantidad > 0) {
									productoNuevo.activo = true;
									await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
								} else {
									productoNuevo.activo = false;
									await Producto.findByIdAndUpdate(productoNuevo._id, productoNuevo);
								}
							}
						}
					}
				);
			}
		}
	} catch (err) {
		res.status(500).json({ message: 'Error en el servidor', err });
	}
};

module.exports = productosCtrl;