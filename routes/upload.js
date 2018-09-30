var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// Modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Middleware fileUpload
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });

    }


    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }


    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extenciones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }


    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a un Path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
    });

    subirPorTipo(tipo, id, nombreArchivo, res);

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Archivo movído',
    //     extensionArchivo: extensionArchivo
    // });

});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    // Usuario
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });

            }

            var pathViejo = './uploads/usuarios/' + usuario.img;


            if (fs.existsSync(pathViejo)) {
                fs.unlin(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario Actualizada',
                    usuario: usuarioActualizado
                });

            });

        });

    }
    // Médico
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });

            }

            var pathViejo = './uploads/medicos/' + medico.img;


            if (fs.existsSync(pathViejo)) {
                fs.unlin(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {


                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen de medico',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizada',
                    medico: medicoActualizado
                });

            });

        });

    }
    // Hospitales
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });

            }

            var pathViejo = './uploads/hospitales/' + hospital.img;


            if (fs.existsSync(pathViejo)) {
                fs.unlin(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen del hospital',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizada',
                    hospital: hospitalActualizado
                });

            });

        });

    }

}


module.exports = app;