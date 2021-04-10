const promocionCtrl = {};
const promocionModel = require('../models/PromocionProducto');
const productoModel = require('../models/Producto');



promocionCtrl.getPromocionMasiva = async (req,res) => {
    try {
        await promocionModel.aggregate([ {"$group" : {_id:"$idPromocionMasiva"}}],async function (err, promociones){
            arraypromociones = [];
            console.log(promociones);
            for(i = 0; i < promociones.length; i++){
                console.log(i);
                if(promociones[i]._id !== null){
                    const productosPromo = await promocionModel.find({idPromocionMasiva: promociones[i]._id }).populate('productoPromocion');
                    arraypromociones.push({
                        productosPromoMasiva: productosPromo
                    });
                }
                if(promociones.length === (i + 1)){
                    res.status(200).json(arraypromociones);
                    console.log(arraypromociones);
                }
            }
            console.log(arraypromociones);
		});
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}

function numerosAleatorios(){
    let aleatorios = "";
    for(i=0; i <= 9; i++){
        aleatorios+= Math.round(Math.random()*9);
    }
    return aleatorios;
}

promocionCtrl.createPromocionMasiva = (req,res) => {
    try {
        const { productos,descuento } = req.body;
        console.log(req.body);
        const aleatorio = numerosAleatorios();
        if(productos.length !== 0){
            console.log("entro a la condicion");
            productos.map( async (producto) => {
                const productoBase = await productoModel.findById(producto.idProducto);
                if(productoBase){
                    const cantidadDescuento = parseFloat(productoBase.precio) * parseFloat(`.${descuento <= 9 ? `0${descuento}` : descuento}`);
                    const precioConDescuento = parseFloat(productoBase.precio) - parseFloat(cantidadDescuento);

                    const nuevaPromocion = new promocionModel(
                        {
                            productoPromocion: producto.idProducto,
                            precioPromocion: precioConDescuento,
                            idPromocionMasiva: aleatorio,
                            porsentajePromocionMasiva: descuento
                        })
                    await nuevaPromocion.save();
                }
            })
            res.status(200).json({message: "Promocion masiva agregada"});
        }else{
            res.status(404).json({message: "Promocion masiva no encontrada."});
        }
        
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}

promocionCtrl.editPromocionMasiva = async (req,res) => {
    try {
        const { productos, descuento } = req.body;
        console.log(req.body);
        const aleatorio = numerosAleatorios();
        const productosPromo = await promocionModel.find({idPromocionMasiva:req.params.idPromocionMasiva });
        if(productosPromo.length){
            productosPromo.map(async (producto) => {
                await promocionModel.findByIdAndDelete(producto._id);
            })
            productos.map( async (producto) => {
                const productoBase = await productoModel.findById(producto.idProducto);
                if(productoBase){
                    const cantidadDescuento = parseFloat(productoBase.precio) * parseFloat(`.${descuento <= 9 ? `0${descuento}` : descuento}`);
                    const precioConDescuento = parseFloat(productoBase.precio) - parseFloat(cantidadDescuento);

                    const nuevaPromocion = new promocionModel(
                        {
                            productoPromocion: producto.idProducto,
                            precioPromocion: precioConDescuento,
                            idPromocionMasiva: aleatorio,
                            porsentajePromocionMasiva: descuento
                        })
                    await nuevaPromocion.save();
                }
            })
            res.status(200).json({message: "Promocion masiva editada"});
        }else{
            res.status(404).json({message: "Promocion masiva no encontrada."});
        }
        
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}

promocionCtrl.deletePromocionMasiva = async (req,res) => {
    try {
        const productosPromo = await promocionModel.find({idPromocionMasiva: req.params.idPromocionMasiva });
        console.log(productosPromo);
        if(productosPromo.length){
            productosPromo.map(async (producto) => {
                await promocionModel.findByIdAndDelete(producto._id);
            })
            res.status(200).json({message: "Promocion masiva Eliminada"});
        }else{
            res.status(404).json({message: "Promocion masiva inexistete"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}

promocionCtrl.promocionLimitante = (req,res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
}


module.exports = promocionCtrl;