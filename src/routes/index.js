const express = require('express')
const app = express()
const path = require('path');
const hbs = require('hbs')
const bcrypt = require('bcrypt');

require('./../helpers/helpers')

const directorioPartials = path.join(__dirname, '../../template/partials');
const dirViews = path.join(__dirname, '../../template/views')

// Schemas
const Curso = require('./../models/curso');
const Usuario = require('./../models/usuario');
const Mensaje = require('./../models/mensaje');

// Sengrid
const sgMail = require('@sendgrid/mail');

// hbs
// registra los partials
hbs.registerPartials(directorioPartials);
//trae el motor del hbs
app.set('view engine', 'hbs');
// cambia el directorio de views por defecto
app.set('views', path.join(dirViews));

// ---------------------------------------------------------- Requests

//default
app.get('/', (req, res) => {
    res.render('index');
});

// --------------------------------------------------------  Coordinador

// cordinador request
app.get('/cordinador', (req, res) => {

    if (!req.session.usuario) return res.render('login');

    if (req.session.usuario.tipo === 'Aspirante') return res.render('index');

    Curso.find({
        cordinadorId: req.session.usuario.id
    }, (err, respuesta1) => {
        if (err) {
            return console.log(err)
        }
        Curso.find({
            estado: 'Disponible',
            cordinadorId: req.session.usuario.id
        }, (err, respuesta2) => {
            if (err) {
                return console.log(err)
            }
            Usuario.find({
                tipo: 'Aspirante'
            }, (err, respuesta3) => {
                if (err) {
                    return console.log(err)
                }
                res.render('cordinador', {
                    cursos: respuesta1,
                    cursosV: respuesta2,
                    aspirantesV: respuesta3
                });
            });
        });
    });
});

app.post('/registrarcurso', (req, res) => {
    let curso = new Curso({
        id: parseInt(req.body.id),
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        valor: parseInt(req.body.valor),
        modalidad: req.body.modalidad,
        intensidad: parseInt(req.body.intensidad) | 0,
        estado: 'Disponible',
        cordinadorId: req.session.usuario.id
    })
    curso.save((err, resultado) => {
        if (err) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
            });
        }
        return res.render('mensaje', {
            mensaje: `<div class="alert alert-success" role="alert">Registro Exitoso</div>`
        });
    })
});

app.post('/cerrarcurso', (req, res) => {
    Curso.updateOne({
        id: req.body.cursoid
    }, {
        estado: 'Cerrado'
    }, (err, curso) => {
        if (err) {
            return console.log(err)
        }

        if (!curso) {
            return res.redirect('/')
        }

        return res.render('mensaje', {
            mensaje: `<div class="alert alert-success" role="alert">Curso Cerrado correctamente</div>`
        });

    });

});

app.post('/desinscribir', (req, res) => {
    let cursoid = parseInt(req.body.cursoid);
    let aspiranteid = parseInt(req.body.aspiranteid);

    Usuario.findOne({
        id: aspiranteid
    }, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }

        var aspiCursos = respuesta.cursos.filter(curid => curid != cursoid);

        Usuario.updateOne({
            id: respuesta.id
        }, {
            cursos: aspiCursos
        }, (err, respuesta1) => {
            if (err) {
                return console.log(err)
            }
            return res.render('mensaje', {
                mensaje: `<div class="alert alert-success" role="alert">Aspirante desinscrito del curso</div>`
            });
        });
    });
});

// --------------------------------------------------------  Interesado

// Interesado request
app.get('/interesado', (req, res) => {
    Curso.find({
        estado: 'Disponible'
    }, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }
        res.render('interesado', {
            cursos: respuesta
        });
    });
});

// --------------------------------------------------------  Aspirante

// Aspirante request
app.get('/aspirante', (req, res) => {

    if (!req.session.usuario) return res.render('login');
    if (req.session.usuario.tipo === 'Cordinador') return res.render('index');
    Curso.find({
        estado: 'Disponible',
        id: {
            $nin: req.session.usuario.cursos
        }
    }, (err, respuesta1) => {
        if (err) {
            return console.log(err)
        }
        Curso.find({
            estado: 'Disponible',
            id: {
                $in: req.session.usuario.cursos
            }
        }, (err, respuesta2) => {
            if (err) {
                return console.log(err)
            }
            return res.render('aspirante', {
                cursos: respuesta1,
                cursosRegistrado: respuesta2
            });
        });

    });
});

// Aspirante request
app.post('/registrarseacurso', (req, res) => {

    var listaCursos = req.session.usuario.cursos;
    listaCursos.push(req.body.cursoid);

    Usuario.updateOne({
        id: req.session.usuario.id
    }, {
        cursos: listaCursos
    }, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }

        return res.render('mensaje', {
            mensaje: `<div class="alert alert-success" role="alert">Registrado al curso correctamente</div>`
        });

    });
});

// --------------------------------------------------------  Usuario

app.get('/registro', (req, res) => {
    res.render('registro');
});

app.post('/registrarse', (req, res) => {

    if (req.session.tipo === 'Administrador') var role = 'Cordinador'
    if (req.body.rol) var role = req.body.rol

    let usuario = new Usuario({
        id: req.body.id,
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        usuario: req.body.usuario,
        contrasena: bcrypt.hashSync(req.body.contrasena, 10),
        tipo: role
    })

    if (usuario.usuario === 'adm!n') return res.render('mensaje', {
        mensaje: `<div class='alert alert-danger' role='alert'>Ya existe ese usuario</div>`
    });

    usuario.save((err, resultado) => {
        if (err) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
            });
        }
        return res.render('mensaje', {
            mensaje: `<div class="alert alert-success" role="alert">Registro Exitoso</div>`
        });
    })
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/ingresar', (req, res) => {

    if (req.body.usuario === 'adm!n') {
        req.session.tipo = 'Administrador';
        return res.render('administrador', {
            admin: true
        });
    }

    Usuario.findOne({
        usuario: req.body.usuario
    }, (err, resultados) => {
        if (err) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
            });
        }
        if (!resultados) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>Usuario no encontrado</div>`
            });
        }
        if (!bcrypt.compareSync(req.body.contrasena, resultados.contrasena)) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>Contraseña Incorrecta</div>`
            });
        }

        //Para crear las variables de sesión
        req.session.usuario = resultados
        let role = false;
        if (req.session.usuario.tipo === 'Cordinador') role = true;

        res.render('index', {
            sesion: true,
            rol: role,
            nombre: req.session.usuario.nombre
        });
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.render('mensaje', {
            mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
        });
    })
    res.redirect('/login')
})

// --------------------------------------------------------  Administrador

app.get('/administrador', (req, res) => {
    if (req.session.tipo === 'Administrador') return res.render('administrador');
    res.redirect('/')
});

// Restablecer contraseña
app.post('/restablecer', (req, res) => {
    let usuario = req.body.usuarioR;
    Usuario.findOne({
        usuario: usuario
    }, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }
        if (err) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
            });
        }
        if (!respuesta) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>Usuario no encontrado</div>`
            });
        } else {
            let enlace = req.headers.host + '/changepass?x=' + respuesta._id;
            let msg = {
                to: respuesta.email,
                from: 'bgiraltube@gmail.com',
                subject: 'Restablecimiento de contraseña - Educación continua',
                text: 'Test',
                html: 'Hemos recibido tu solicitud de restablecimiento de contraseña.' +
                    '\n' + 'Ve a este link para restablecer la contraseña <a href="http://' + enlace + '">Visita el sitio aquí</a>',
            };
            sgMail.send(msg);
            return res.render('mensaje', {
                mensaje: `<div class="alert alert-success" role="alert">Se ha enviado un correo para restablecer la contraseña</div>`
            });
        }

    });
});

app.get('/changepass', (req, res) => {
    res.render('changepass', {
        userid: req.query.x
    });
});

app.post('/restorepass', (req, res) => {
    if (req.body.pass !== req.body.pass1) {
        return res.render('mensaje', {
            mensaje: `<div class='alert alert-danger' role='alert'>Las contraseñas no coinciden</div>`
        });
    }

    Usuario.findById({
        _id: req.body.userid
    }, (err, respuesta) => {
        respuesta.contrasena = bcrypt.hashSync(req.body.pass1, 10);
        respuesta.save((err, resultado) => {
            if (err) {
                return res.render('mensaje', {
                    mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
                });
            }
            return res.render('mensaje', {
                mensaje: `<div class="alert alert-success" role="alert">Contraseña Restablecida</div>`
            });
        })
    });
});

// --------------------------------------------------------  Chat

app.get('/chatgeneral', (req, res) => {

    if (req.session.tipo !== 'Administrador') return res.redirect('/');

    Mensaje.find({
        isadminmessage: true
    }, (err, respuesta) => {
        if (err) {
            return console.log(err)
        }
        var resp = '<p>';
        respuesta.forEach(msj => {
            resp += '<br/>' + 'Administrador: ' + msj.texto + ' - ' + msj.date
        });
        resp += '</p>'
        res.render('chatgeneral', {
            mensajes: resp
        });
    });
});


app.get('/chat', (req, res) => {

    if (!req.session.usuario) return res.render('login');
    if (req.session.tipo === 'Administrador') return res.redirect('/');

    Mensaje.find({
        isadminmessage: true
    }, (err, respuesta1) => {
        if (err) {
            return console.log(err)
        }
        Usuario.find({}, (err, respuesta2) => {
            if (err) {
                return console.log(err)
            }

            var resp = '<p>';
            respuesta1.forEach(msj => {
                resp += '<br/>' + 'Administrador: ' + msj.texto + ' - ' + msj.date
            });
            resp += '</p>'
            
            res.render('chat', {
                mensajes: resp,
                tipo: req.session.usuario.tipo,
                usuarios: respuesta2
            });
        });
    });
});

// --------------------------------------------------------  App

// Error request
app.get('*', (req, res) => {
    res.render('error');
});

module.exports = app