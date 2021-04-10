const blogCtrl = {};
const imagen = require('./uploadFile.controllers');
const blogModel = require('../models/Blog');

blogCtrl.subirImagen = async (req, res, next) => {
    await imagen.upload(req, res, function (err) {
        if (err) {
            res.status(400).json({ message: err });
        }
        return next();
    });
};

blogCtrl.getBlogs = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page,
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }
    blogModel.paginate({}, options, (err, postStored) => {
        if (err) {
            res.status(500).json({ message: "Error en el servidor",err });
        } else {
            if (!postStored) {
                res.status(400).json({ message: "Error al mostrar Blogs" })
            } else {
                res.status(200).json({ posts: postStored });
            }
        }
    });
}


blogCtrl.createBlog = async (req, res) => {
    try {
        if (!req.file) {
            res.status(404).json({ message: "La imagen es obligatoria" });
        } else {
            const newBlog = new blogModel(req.body);
            newBlog.imagen = req.file.key;
            await newBlog.save((err, postStored) => {
                if (err) {
                    res.status(500).json({ message: "Parece que se duplico la url",err })
                } else {
                    if (!postStored) {
                        res.status(404).json({ message: "No se a podido crear el Blog" });
                    } else {
                        res.status(200).json({ message: "Blog creado correctamente" });
                    }
                }
            });
        }
    } catch (err) {
        res.status(500).send({ message: "Error en el servidor",err })
        console.log(err);
    }

}

blogCtrl.updateBlog = async (req, res) => {
    try {
        const blogBase = await blogModel.findById(req.params.id);
        const newBlog = req.body;
        if (req.file) {
            newBlog.imagen = req.file.key;
            await imagen.eliminarImagen(blogBase.imagen);
        } else {
            newBlog.imagen = blogBase.imagen;
        }
        await blogModel.findByIdAndUpdate(req.params.id, newBlog, (err, postStored) => {
            if (err) {
                res.status(500).json({ message: "Error en el servidor",err })
            } else {
                if (!postStored) {
                    res.status(400).json({ message: "No se a podido actualizar el blog" });
                } else {
                    res.status(200).json({ message: "Blog actualizado" });
                }
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error en el servidor",err })
        console.log(err);
    }

}

blogCtrl.getBlog = async (req, res) => {
    try {
        const { url } = req.params;
        await blogModel.findOne({ url }, (err, postStored) => {
            if (err) {
                res.status(500).json({ message: "Error en la base",err });
            } else {
                if (!postStored) {
                    res.status(400).json({ message: "Error al eliminar" });
                } else {
                    res.status(200).json({ post: postStored })
                }
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error en el servidor",err })
        console.log(err);
    }

}

blogCtrl.deleteBlog = async (req, res) => {
    try {
        const blogBase = await blogModel.findById(req.params.id);
        if(blogBase){
            if (blogBase.imagen && blogBase.imagen != null) {
                await imagen.eliminarImagen(blogBase.imagen);
            }
            await blogModel.findByIdAndDelete(req.params.id, (err, postStored) => {
                if (err) {
                    res.status(500).json({ message: "Error en la base",err });
                } else {
                    if (!postStored) {
                        res.status(400).json({ message: "Error al eliminar" });
                    } else {
                        res.status(200).json({ message: "Blog eliminado" })
                    }
                }
            });
        }else{
            res.json({ message: "Este blog no existe" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error en el servidor",err })
        console.log(err);
    }
}

module.exports = blogCtrl;