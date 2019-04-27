const express = require('express')
const app = express()
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//Sengrid
const sgMail = require('@sendgrid/mail');
// sockets
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//### Para usar las variables de sesión
const session = require('express-session')
var MemoryStore = require('memorystore')(session)

require('./config/config');

// registra el directorio publico
const directoriopublico = path.join(__dirname, '../public');
app.use(express.static(directoriopublico));

//bootstrap config
const dirNode_modules = path.join(__dirname, '../node_modules')
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

//BodyParser
app.use(bodyParser.urlencoded({
	extended: false
}));

// memorystore
//### Para usar las variables de sesión
app.use(session({
	cookie: {
		maxAge: 86400000
	},
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}))

// Middleware
app.use((req, res, next) => {
	//En caso de usar variables de sesión
	if (req.session.usuario) {
		res.locals.sesion = true;
		res.locals.nombre = req.session.usuario.nombre;
		if (req.session.usuario.tipo === 'Cordinador') {
			res.locals.rol = true;
		}
		user = req.session.usuario;
	}
	if (req.session.tipo === 'Administrador') {
		res.locals.admin = true;
		user = {
			nombre: 'Administrador',
			tipo: 'Administrador'
		};
	}
	next()
})

//Routes
app.use(require('./routes/index'));

// Mongoose
mongoose.connect(process.env.URLDB, {
	useNewUrlParser: true
}, (err, resultado) => {
	if (err) {
		return console.log(error)
	}
	console.log("conectado")
});

// Sengrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// schemas
const Mensaje = require('./models/mensaje');
const Usuario = require('./models/usuario');

// methods 
const savegeneralmsj = (mensaje) => {
    mensaje.save((err, resultado) => {
        if (err) {
            return res.render('mensaje', {
                mensaje: `<div class='alert alert-danger' role='alert'>${err}</div>`
            });
        }
    })
};


//sockets
io.on('connection', client => {

	client.on("texto", (text, callback) =>{
		let fecha = new Date().toDateString()
		let texto = `admin : ${text} - ${fecha}`
		let mensaje = new Mensaje({
			isadminmessage: true,
			texto: text,
			date: fecha
		});
		savegeneralmsj(mensaje);
		io.emit("texto", (texto))
		callback()
	})

	client.on("textopriv", (text, receiverid,  callback) =>{
		let fecha = new Date().toDateString()
		let mensaje = new Mensaje({
			transmitterid: user.id,
			receiverid: receiverid,
			texto: text,
			date: fecha
		});
		savegeneralmsj(mensaje);
		callback()
	})

	client.on("showprivchat", (receiverid,  callback) =>{
		Mensaje.find({$or:[ {'transmitterid': user.id, 'receiverid': receiverid},
							{'transmitterid':receiverid, 'receiverid': user.id} ]}, (err, respuesta1) => {
			if (err) {
				return console.log(err)
			}
			Usuario.findOne({ id: receiverid }, (err, respuesta2) => {
				if (err) {
					return console.log(err)
				}
				var res = '';
				respuesta1.forEach(msj => {
					res +='<br/>' + respuesta2.nombre + ': ' + msj.texto + ' - ' + msj.date
				});

				io.emit("showmsjpriv", (res));
			});
		});
		//callback()
	})

});

server.listen(process.env.PORT, () => {
	console.log('servidor en el puerto ' + process.env.PORT)
});

