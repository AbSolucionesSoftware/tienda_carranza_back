const carouselCtrl = {};
const Carousel = require('../models/Carousel');
const imagen = require('./uploadFile.controllers');

carouselCtrl.subirImagen = (req, res, next) => {
	imagen.upload(req, res, function (error) {
		if (error) {
			res.status(404).json({ message: 'Formato de imagen no valido', error });
		}
		return next();
	});
};

carouselCtrl.crearCarousel = async (req, res) => {
	console.log(req.body);
    const newCarousel = new Carousel(req.body);
    if (req.file) {
		newCarousel.imagen = req.file.key;
    }
    await newCarousel.save((err, response) => {
        if(err){
            res.status(500).json({message: 'Hubo un error al crear el carousel', err})
        }else{
            if(!response){
                res.status(404).json({message: 'Carousel no encontrado'})
            }else{
                res.status(200).json({message: 'Carousel creado', response})
            }
        }
    })
}

carouselCtrl.obtenerTodosCarousels = async (req, res, next) => {
    try {
		const carousel = await Carousel.find().sort({ "createdAt" : -1});
		res.status(200).json(carousel);
    } catch (error) {
        res.status(500).json({ message: 'Hubo un error al obtener carouseles', error });
        next();
    }
}

carouselCtrl.obtenerLimiteCarousels = async (req, res, next) => {
    try {
		const carousel = await Carousel.find().sort({ "createdAt" : -1}).limit(10);
		res.status(200).json(carousel);
    } catch (error) {
        res.status(500).json({ message: 'Hubo un error al obtener carouseles', error });
        next();
    }
}

carouselCtrl.obtenerCarousel = async (req, res) => {
    const carousel = await Carousel.findById(req.params.idCourrucel);
    try {
        if(!carousel){
            res.status(404).json({message: 'Carousel no encontrado'})
        }else{
			res.status(200).json(carousel)
		}   
    } catch (error) {
        res.status(500).json({message: 'Hubo un error al obtener el carousel', error})
    }
}

carouselCtrl.actualizarCarousel = async (req, res) => {
    try {
		const carouselDeBase = await Carousel.findById(req.params.idCourrucel);
		if(!carouselDeBase){
			res.status(404).json({message: 'Carousel no encontrado'})
		}else{
			//Construir nuevo producto
			const nuevoCarousel = req.body;
			//Verificar si mandaron imagen
			if (req.file) {
				console.log(req.file.key);
				nuevoCarousel.imagen = req.file.key;
				if(carouselDeBase.imagen){
					await imagen.eliminarImagen(carouselDeBase.imagen);
				}
			} else {
				nuevoCarousel.imagen = carouselDeBase.imagen;
			}
			const carousel = await Carousel.findByIdAndUpdate(req.params.idCourrucel, nuevoCarousel);
			res.status(200).json({message: 'Carousel Actualizado', carousel})
		}
		
	} catch (error) {
		res.status(500).json({message: 'Error al actualizar Carousel', error})
	}
}

carouselCtrl.eliminarCarousel = async (req, res) => {
    const carouselDeBase = await Carousel.findById(req.params.idCourrucel);;
	try {
		if (!carouselDeBase) {
			res.status(404).json({ message: 'Carousel no encontrado' });
		}else{
			if (carouselDeBase.imagen) {
				await imagen.eliminarImagen(carouselDeBase.imagen);
			}
		
			const carousel = await Carousel.findByIdAndDelete(req.params.idCourrucel);
			if (!carousel) {
				res.status(404).json({ message: 'Carousel no encontrado' });
			}
			res.status(200).json({ message: 'Carousel eliminado' });
		}		
	} catch (error) {
		res.status(500).json({message: 'Error al eliminar Carousel', error})
	}
}

module.exports = carouselCtrl;
