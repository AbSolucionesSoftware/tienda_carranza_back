const sugerenciaCtrl = {};
const Sugerencia = require('../models/Sugerencia');
const mongoose = require('mongoose')

sugerenciaCtrl.crearSugerencia = async (req, res) => {
	const newSugerencia = new Sugerencia(req.body);
	await newSugerencia.save((err, response) => {
		if (err) {
			res.status(500).json({ message: 'Hubo un error al crear esta sugerencia', err });
		} else {
			if (!response) {
				res.status(404).json({ message: 'Error al crear sugerencia' });
			} else {
				res.status(200).json({ message: 'Sugerencia creada', response });
			}
		}
	});
};

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

sugerenciaCtrl.obtenerSugerencia = async (req, res) => {
	try {
		await Sugerencia.aggregate([
			{
				$lookup: {
					from: 'promocions',
					localField: 'sugerencias.producto',
					foreignField: 'productoPromocion',
					as: 'promocionSugerencia'
				}
            },
            {
				$lookup: {
					from: 'promocions',
					localField: 'producto',
					foreignField: 'productoPromocion',
					as: 'promocionProducto'
				}
            },
            {
                $match: {
                    producto: mongoose.Types.ObjectId(req.params.idProducto)
                }
            }
		]).exec(async function(err, transactions) {
			if (err) {
				res.send({ message: 'Error al obtener sugerencia', err });
			} else {
				await Sugerencia.populate(transactions, { path: 'producto sugerencias.producto' }, function(err, populatedTransactions
				) {
					// Your populated translactions are inside populatedTransactions
					if (err) {
						res.send({ message: 'Error al obtener sugerencia', err });
					} else {
						res.json(populatedTransactions[0]);
					}
				});
			}
		});
	} catch (error) {
		res.status(500).json({ message: 'Hubo un error al obtener esta sugerencia', error });
	}
};

sugerenciaCtrl.actualizarSugerencia = async (req, res) => {
	await Sugerencia.findOneAndUpdate({ producto: req.params.idProducto }, req.body, (err, response) => {
		if (err) {
			res.status(500).json({ message: 'Hubo un error al actualizar esta sugerencia', err });
		} else {
			if (!response) {
				res.status(404).json({ message: 'Sugerencia no encontrada' });
			} else {
				res.status(200).json({ message: 'Sugerencia Actualizada', response });
			}
		}
	});
};

sugerenciaCtrl.eliminarSugerencia = async (req, res) => {
	const sugerencia = await Sugerencia.findOneAndDelete({ producto: req.params.idProducto });
	try {
		if (!sugerencia) {
			res.status(404).json({ message: 'Sugerencia no encontrada' });
		} else {
			res.status(200).json({ message: 'Sugerencia de compra eliminada' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Hubo un error al eliminar esta sugerencia', error });
	}
};

module.exports = sugerenciaCtrl;
