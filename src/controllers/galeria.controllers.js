const galeriaCtrl = {};
const Galeria = require('../models/Galeria');
const imagen = require('./uploadFile.controllers');

galeriaCtrl.subirImagen = (req, res, next) => {
	imagen.upload(req, res, function (err) {
		if (err) {
			res.status(404).json({ message: "Formato de imagen no valido", err });
		}else{
            return next();
        }	
	});
};

galeriaCtrl.crearGaleria = async (req, res, next) => {
    const galeria = await Galeria.findOne({ producto: req.params.idProducto})
    if(!galeria){
        //const {producto} = req.body;
        if(!req.file){
            res.status(404).json({message: 'La Galeria al menos debe tener una imagen'})
        }else{
            const newGaleria = new Galeria({
                producto: req.params.idProducto,
                imagenes: [{
                    url: req.file.key
                }]
            });
            await newGaleria.save((err, userStored) => {
                if (err) {
                    res.status(500).json({ message: 'Hubo un error al registrar la galeria', err });
                } else {
                    if (!userStored) {
                        res.status(404).json({ message: 'Galeria no encontrada' });
                    } else {
                        res.status(200).json({message: 'Galeria creada', userStored});
                    }
                }
            });
        }
    }else{
        next();
    }
}

galeriaCtrl.obtenerGaleria = async (req, res) => {
    try {
        const galeria = await Galeria.findOne({ producto: req.params.idProducto}).populate('producto', 'nombre');
        if(!galeria){
            res.status(404).json({ message: 'Galeria no encontrada' });
        }else{
            res.status(200).json(galeria);
        }   
    } catch (error) {
        res.status(500).json({ mensaje: 'Hubo un error al obtener esta galeria', error });
    }
}

galeriaCtrl.crearImagen = async (req, res) => {
    const producto = await Galeria.findOne({ producto: req.params.idProducto})
    await Galeria.findOneAndUpdate(
        {
            _id: producto._id
        },
        {
            $addToSet:
            {
                imagenes:
                {
                    url: req.file.key
                }
            }
        }, async (err, userStored) => {
            if (err) {
                res.status(500).json({ messege: 'Hubo un error al crear la imagen', err });
            } else {
                if (!userStored) {
                    res.status(404).json({ message: 'Imagen no encontrada' });
                } else {
                    const galeria = await Galeria.findOne({_id: producto._id})
                    res.status(200).json({message: 'Imagen creada', galeria});
                }
            }
        }
    );
 
}


galeriaCtrl.actualizarImagen = async (req, res) => {
        const datos = await Galeria.findOne({ producto: req.params.idProducto});        
        const imagenes = datos.imagenes
        const urlB = imagenes.filter(x => x._id == req.params.idImagen)
        urlB.map( async (urlBase) => {
            if (req.file) {
                url = req.file.key;
                await imagen.eliminarImagen(urlBase.url);
            } else {
                url = urlBase.url;
            }

            await Galeria.updateOne(
                {
                    'imagenes._id': req.params.idImagen
                },
                {
                    $set: { 'imagenes.$': { url : url } }
                }, (err, response) => {
                    if(err){
                        res.status(500).json({message: 'Hubo un error al actualizar imagen', err})
                    }else{
                        if(!response){
                            res.status(404).json({message: 'Imagen no encontrada'})
                        }else{
                            res.status(200).json({message: 'Imagen actualizada', response})
                        }
                    }
                }
            ); 
        })
}


galeriaCtrl.eliminarImagen = async (req, res) => {
    const datos = await Galeria.findOne({ producto: req.params.idProducto});  
    const imagenes = datos.imagenes
    const urlB = imagenes.filter(x => x._id == req.params.idImagen)
    urlB.map( async (urlBase) => {
        await imagen.eliminarImagen(urlBase.url);
        await Galeria.updateOne(
        {
            producto: req.params.idProducto
        },
        {
            $pull:
            {
                imagenes:
                {
                    _id: req.params.idImagen
                }
            }
        }, (err, response) => {
            if(err){
                res.status(500).json({message: 'Hubo un error al eliminar imagen', err})
            }else{
                if(!response){
                    res.status(404).json({message: 'Imagen no encontrada'})
                }else{
                    res.status(200).json({message: 'Imagen Eliminada'})
                }
            }
        });
    })
}

galeriaCtrl.eliminarGaleria = async (req, res) => {
    const datos = await Galeria.findOne({ producto: req.params.idProducto});  
    datos.imagenes.map( async (imagenes) => {
       try {
            await imagen.eliminarImagen(imagenes.url);
       } catch (error) {
           res.status(500).json({message: 'hubo un error al eliminar imagen', err})
       }
    })
    await Galeria.findOneAndDelete({producto: req.params.idProducto}, (err, response) => {
        if(err){
            res.status(404).json({message: 'galeria no encontrada'})  
        }else{
            res.status(200).json({message: 'Galeria Eliminada'})
        }
    })  
}

module.exports = galeriaCtrl;