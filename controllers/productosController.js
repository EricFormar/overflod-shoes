const fs = require('fs')
const path = require('path');

/*let productos = fs.readFileSync(path.join(__dirname, '..', 'data', 'productos.json'), 'utf-8')
productos = JSON.parse(productos)

let usuarios = fs.readFileSync(path.join(__dirname, '..', 'data', 'usuarios.json'), 'utf-8')
usuarios = JSON.parse(usuarios) */

const db = require('../db/models')
const {validationResult}= require('express-validator')
const Sequelize = require('sequelize')
let Op= Sequelize.Op;

module.exports = {
    listado : function(req,res){
        db.Products.findAll({
           include: [
               {
               association: "categoria"
           },
           {
                association: "marca"
            }
            ]
       })
    .then(productos =>{
            res.render('productos',{
                title: 'Nuestros productos disponibles',
                css: 'productos.css',
                productos : productos,
                usuario: req.session.user
            })
        })
        
    },
    carrito: (req,res) =>{

        db.Products.findOne({
            where : {
                id: req.params.id
            }
        })
        .then(producto => {
        res.render('carrito', { 
            title: 'Carrito de compras',
            css: 'carrito.css',
            producto: producto,
            usuario: req.session.user
    
    })
})
},
detalle: function(req,res){
     
            db.Products.findOne({
            where : {
                id: req.params.id
            },
            include : [
                {
                    association: 'categoria'
                },
                {
                    association: 'marca'
                },
                {
                    association: 'talle'
                },
                {
                    association: 'color'
                }
            ]
        })
        
            .then(producto => {
                res.render('producto', {
                    title: 'Detalle del producto',
                    css: 'detalleProducto.css',
                    producto: producto,
                    usuario: req.session.user
                })
            })
},
    buscador: (req,res) =>{
        let busqueda = req.body.search
        db.Products.findAll({
            where: {
                
                nombre: {[Op.like]: busqueda}
            }
        })
        .then(producto => {
            res.render('busqueda',{
                title: "Resultado de la busqueda",
                css:"style.css",
                productos:producto
            })
        })
        .catch(error=>{
            res.send(error)
        })
},
vistaAgregar: (req,res) =>{
    //res.send('aca estoy')
    const categories = db.Categories.findAll()
    const marcas = db.Brand.findAll()
    const colores = db.Colors.findAll()
    const talle = db.Size.findAll()
    Promise.all([categories ,marcas, colores, talle])
    .then(([categories, marcas, colores, talle]) =>{
        
                res.render('CargaDeproducto', {
                    title: 'Agregar producto...',
                    css: 'cargaProducto.css',
                    categories: categories,
                    marca: marcas,
                    colores: colores,
                    talle: talle,
                    usuario: req.session.user,
                    script: 'productosValidator.js'
                })
            })
    },

    agregar: function (req, res) {
        db.Products.create({
                nombre: req.body.nombre,
                precio: Number(req.body.precio),
                id_categoria: req.body.categoria,
                id_marca: req.body.marca,
                id_colores: req.body.color,
                id_talles: req.body.talle,
                descripcion: req.body.descripcion,
                imagenes: req.files[0].filename
        })
            .then(product => {

                return res.redirect('/productos')
            })
            .catch(err => {
                res.send(err)
            })


},
    vistaEditar: (req, res) =>{

        let producto = db.Products.findOne({
            where : {
                id: req.params.id
            },
            include : [
                {
                    association: 'categoria'
                },
                {
                        association: 'marca'
                    },
                    {
                        association: 'talle'
                    },
                    {
                        association: 'color'
                    }
            ]
        })

         .then(producto =>{
            res.render('editarProducto',{
            title:'Editar producto',
            css:'editarProducto.css',
            producto: producto,
           })
          
    })
    },

    editar: (req, res) =>{
        db.Products.update({
            nombre: req.body.nombre,
            precio: req.body.precio,
            descripcion: req.body.descripcion,
            id_categoria: req.body.categoria,
        },
            {
                where: {
                    id: req.params.id
                }
            })

        res.redirect("/productos/detalle/" + req.params.id)
    },
    eliminar: function (req, res) {
        db.Products.destroy({
            where: {
                id: req.params.id
            }
        })
            .then(() => {
                res.redirect('/productos')
            })
            .catch(errores => {
                res.send(errores)
            })
    }
}