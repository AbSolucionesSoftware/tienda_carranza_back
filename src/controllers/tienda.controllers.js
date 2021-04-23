const tiendaCtrl = {};
const imagen = require('./uploadFile.controllers');
const Tienda = require('../models/Tienda');

tiendaCtrl.subirImagen = async (req,res,next) => {
    imagen.upload(req, res, function (err) {
		if (err) {
			res.status(404).json({ message: "formato de imagen no valido", err });
		}else{
			return next();
		}
	});
}

tiendaCtrl.crearTienda = async (req, res) => {
    console.log(req.body);
    const {nombre,telefono,calle_numero,cp,colonia,ciudad,imagenCorp,linkFace,linkInsta,linkTweeter,estado, diasHorariosEmpresas} = req.body;
    let phone = "";
    if(telefono){
        phone = telefono.trim(" ");
    }
    if(imagenCorp === null || imagenCorp === 'null' || imagenCorp === undefined || imagenCorp === 'undefined'){
        imagenCorp = '';
    }
    const newTienda = new Tienda({
        nombre: nombre,
        telefono: phone,
        direccion:[{
            calle_numero:calle_numero,
            cp:cp,
            colonia:colonia,
            ciudad:ciudad,
            estado:estado
        }],
        imagenCorp:imagenCorp,
        linkFace:linkFace,
        linkInsta:linkInsta,
        linkTweeter:linkTweeter,
        diasHorariosEmpresas: diasHorariosEmpresas
    });
    newTienda.activo = true;
    if(req.file){
        newTienda.imagenLogo = req.file.key;
    }
    await newTienda.save((err, response) => {
        if(err){
            res.status(500).json({message: 'Error al crear Tienda', err});
        }else{
            res.status(200).json({message: 'Tienda creada', response});
        }
    })
};

tiendaCtrl.politicasEmpresa = async (req,res) => {
    try {
        console.log(req.body);
        //{ politicas,PoliticasVentas,PoliticasEnvios,PoliticasDescuentos,PoliticasDevolucion }
        await Tienda.findByIdAndUpdate(req.params.idTienda,req.body);
        res.status(200).json({message: "Politicas agregadas"});
    } catch (error) {
        res.status(500).json({ message: 'Hubo un error al obtener esta tienda', error });
        console.log(error);
    }
}

tiendaCtrl.obtenerTienda = async (req, res) => {
    try {
        const tienda = await Tienda.find();
            res.status(200).json(tienda);
    } catch (error) {
            res.status(500).json({ message: 'Hubo un error al obtener esta tienda', error });
    }
};

tiendaCtrl.actualizarTienda = async (req, res) => {
    const {nombre,telefono,calle_numero,cp,colonia,ciudad,lat,lng,politicas,imagenCorp,linkFace,linkInsta,linkTweeter,estado,diasHorariosEmpresas} = req.body;
    const infoTiendaBase =  await Tienda.findById(req.params.idTienda);
    const newTienda = {
        nombre: nombre,
        telefono: telefono,
        direccion:[{
            calle_numero:calle_numero,
            cp:cp,
            colonia:colonia,
            ciudad:ciudad,
            estado:estado
        }],
        ubicacion:[{
            lat:lat,
            lng:lng
        }],
        politicas:politicas,
        imagenCorp:imagenCorp,
        linkFace:linkFace,
        linkInsta:linkInsta,
        linkTweeter:linkTweeter,
        diasHorariosEmpresas:diasHorariosEmpresas
    };
    console.log(req.file);
    if(req.file){
        if(infoTiendaBase.imagenLogo){
            await imagen.eliminarImagen(infoTiendaBase.imagenLogo);
        }
        newTienda.imagenLogo = req.file.key;
    }else{
        newTienda.imagenLogo = infoTiendaBase.imagenLogo;
    }
 	await Tienda.findOneAndUpdate({_id: req.params.idTienda}, newTienda, (err, response) => {
        if(err){
            res.status(500).json({message: 'Error al actualizar Tienda', err});
        }else{
            if(!response){
                res.status(404).json({ message: 'Tienda no encontrada'});
            }else{
                res.status(200).json({message: 'Tienda Actualizada'});
            }
        }
    }) 
};

tiendaCtrl.eliminarTienda = async (req, res) => {
    try {
        await Tienda.findByIdAndDelete(req.params.idTienda);
        res.status(200).json({message: "Tienda eliminada"});
    } catch (error) {
        res.status(500).json({message: 'Hubo un error al eliminar Tienda', error});
    }
};

tiendaCtrl.cambiarColoresTienda = async (req,res) => {
    try {
        //const {navPrimary,navSecondary,bodyPage} = req.body;
        console.log(req.body);
        await Tienda.findByIdAndUpdate(req.params.idTienda,{colorPage: req.body});
        res.status(200).json({message: "Cambios realizados"});
    } catch (error) {
        res.status(500).json({message: 'Hubo un error al eliminar Tienda', error});
        console.log(error);
    }
}

tiendaCtrl.agregarHorarios = async (req,res) => {
    try {
        const tienda = await Tienda.findOne();
        if(tienda){
            await Tienda.findByIdAndUpdate(tienda._id,{ horario: req.body });
            res.status(200).json({message: "Horarios agregados."});
        }else{
            res.status(505).json({message: "No hay tienda"});
        }
    } catch (error) {
        res.status(500).json({message: 'Hubo un error al eliminar Tienda', error});
        console.log(error);
    }
}

module.exports = tiendaCtrl;
