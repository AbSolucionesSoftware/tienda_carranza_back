const bannerCtrl =  {};
const imagen = require('./uploadFile.controllers');
const modelBanner = require('../models/BannerCategoria');

bannerCtrl.subirImagen = async (req,res,next) => {
    imagen.upload(req, res, function (err) {
		if (err) {
			res.status(404).json({ message: "formato de imagen no valido", err });
		}else{
			return next();
		}
	});
}

bannerCtrl.getBanners = async (req,res) => {
    try {
        const banners = await modelBanner.find({publicado: true}).sort({createdAt: 1});
        res.status(200).json(banners);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.getBannersAdmin = async (req,res) => {
    try {
        const banners = await modelBanner.find().sort({createdAt: 1});
        res.status(200).json(banners);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.createBanner = async (req,res) => {
    try {
        console.log(req.body);
        const banner = new modelBanner(req.body);
        banner.publicado = false;
        await banner.save((err, userStored) => {
            if (err) {
				res.status(500).json({ message: 'Ups, algo paso al crear el banner', err });
			} else {
				if (!userStored) {
					res.status(404).json({ message: 'Error al crear el banner' });
				} else {
					res.status(200).json({ message: 'Banner creado correctamente.',  userStored });
				}
			}
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.getBanner = async (req,res) => {
    try {
        const banner =  await modelBanner.findById(req.params.idBanner);
        res.status(200).json(banner);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.publishedBanner = async (req,res) => {
    try {
        const { publicado } = req.body;
        await modelBanner.findByIdAndUpdate(req.params.idBanner,{publicado});
        res.status(200).json({message: "Cambio realizado."});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.agregateBanner = async (req,res) => {
    try {
        const {orientacion,vincular,mostrarProductos,mostrarTitulo,categoria,temporada,genero} = req.body;
        console.log(req.body);
        const banner = {
            tipo: {}
        };
        banner.vincular = vincular;
        banner.mostrarProductos = mostrarProductos;
        banner.mostrarTitulo = mostrarTitulo;
        if(req.file){
            banner.imagenBanner = req.file.key;
        }
        if(orientacion){
            banner.orientacion = orientacion;
        }
        if(categoria){
            banner.tipo.categoria = categoria;
        }
        if(temporada){
            banner.tipo.temporada = temporada;
        }
        if(genero){
            banner.tipo.genero = genero;
        }
        await modelBanner.updateOne(
            {
                _id: req.params.idBanner
            },
            {
                $addToSet: {
                    banners: [ banner ]
                }
            },(err, userStored) => {
                if (err) {
                    res.status(500).json({ message: 'Ups, algo paso al crear el banner', err });
                } else {
                    if (!userStored) {
                        res.status(404).json({ message: 'Error al crear el banner' });
                    } else {
                        res.status(200).json({ message: 'Banner agregado correctamente.',  userStored });
                    }
                }
            }
        )
        //res.status(200).json({message: "Banner agregado correctamente."});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.editSubBanner = async (req,res) => {
    try {
        const bannerBase = await modelBanner.findById(req.params.idBanner);
        const subBanner = bannerBase.banners;
        const banners = subBanner.filter((x) => x._id == req.params.idSubBanner);
        //console.log(banners);
        console.log(req.body);
        console.log(req.file);
        banners.map(async (bannerBase) => {
            const { orientacion ,vincular ,mostrarProductos ,mostrarTitulo , categoria, temporada,genero} = req.body;
            
            const newBanner = {
                tipo: {}
            };
            newBanner.vincular = vincular;
            newBanner.mostrarProductos = mostrarProductos;
            newBanner.mostrarTitulo = mostrarTitulo;
            if(req.file){
                newBanner.imagenBanner = req.file.key;
                if(bannerBase.imagenBanner){
                    imagen.eliminarImagen(bannerBase.imagenBanner);
                }
            }else{
                newBanner.imagenBanner = bannerBase.imagenBanner;
            }
            if(orientacion){
                newBanner.orientacion = orientacion;
            }
            if(categoria){
                newBanner.tipo.categoria = categoria;
            }
            if(temporada){
                newBanner.tipo.temporada = temporada;
            }
            if(genero){
                newBanner.tipo.genero = genero;
            }
            console.log(newBanner);
            await modelBanner.updateOne(
                {
                    'banners._id': req.params.idSubBanner
                },
                {
                    $set: { 'banners.$': newBanner}
                },(err, userStored) => {
                if (err) {
                    res.status(500).json({ message: 'Ups, algo paso al crear el banner', err });
                } else {
                    if (!userStored) {
                        res.status(404).json({ message: 'Error al crear el banner' });
                    } else {
                        res.status(200).json({ message: 'Banner editado correctamente.',  userStored });
                    }
                }
            })
        })

        //res.status(200).json({message: "Registro echo"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.deleteSubCanner = async (req,res) => {
    try {
        const bannerBase = await modelBanner.findById(req.params.idBanner);
        const subBanner = bannerBase.banners;
        const banners = subBanner.filter((x) => x._id == req.params.idSubBanner);
        banners.map( async (banner) => {
            if(banner.imagenBanner){
                imagen.eliminarImagen(banner.imagenBanner);
            }
        })

        await modelBanner.updateOne(
            {
                _id: req.params.idBanner
            },
            {
                $pull: {
                    banners: {
                        _id: req.params.idSubBanner
                    }
                }
            }
        );
        res.status(200).json({ message: 'Banner eliminado.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.deleteBanner = async (req,res) => {
    try {
        const bannerBase = await modelBanner.findById(req.params.idBanner);
        if(bannerBase){
            const subBanner = bannerBase.banners;
            subBanner.map((banner) => {
                if(banner.imagenBanner){
                    imagen.eliminarImagen(banner.imagenBanner);
                }
            })
            await modelBanner.findByIdAndDelete(req.params.idBanner);
            res.status(200).json({message: "Banner eliminado."})
        }else{
            res.status(404).json({ message: "El banner no existe" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error });
    }
}

bannerCtrl.eliminarImagen = async (req,res) => {
    try {

        const bannerBase = await modelBanner.findById(req.params.idBanner);
        const subBanner = bannerBase.banners;
        const banners = subBanner.filter((x) => x._id == req.params.idSubBanner);
        //console.log(banners);
        console.log(req.body);
        banners.map(async (bannerBase) => {
            const { orientacion ,vincular ,mostrarProductos ,mostrarTitulo , categoria, temporada} = req.body;
            
            const newBanner = {
                tipo: {}
            };
            newBanner.vincular = vincular;
            newBanner.mostrarProductos = mostrarProductos;
            newBanner.mostrarTitulo = mostrarTitulo;

            if(orientacion){
                newBanner.orientacion = orientacion;
            }
            if(categoria){
                newBanner.tipo.categoria = categoria;
            }
            if(temporada){
                newBanner.tipo.temporada = temporada;
            }
            console.log(newBanner);
            await modelBanner.updateOne(
                {
                    'banners._id': req.params.idSubBanner
                },
                {
                    $set: { 'banners.$': newBanner}
                }
            )
        })

        res.status(200).json({message: "Registro echo"});

        const bannerEliminar = await modelBanner.findById(req.params.idBanner);
        const newBanner = {};
        if(bannerEliminar.imagenBanner){
            await imagen.eliminarImagen(bannerEliminar.imagenBanner);
            newBanner.imagenBanner = '';
            await modelBanner.findByIdAndUpdate(req.params.idBanner,newBanner);
        }
        res.status(200).json({message: "Imagen eliminada."})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error en el servidor",error }); 
    }
}

module.exports = bannerCtrl;