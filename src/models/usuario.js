const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const usuarioSchema = new Schema({
	id : {
		type : Number,
		required : true,
		unique: [true, 'Ya existe usuario con la identificación indicada']
	},
	cursos :{
		type : [Number]
	},
	nombre : {
		type : String,
		required : true	
	},
	email : {
        type: String,
        required : true
	},
	telefono : {
        type: Number,
		required: true				
	},
	tipo: {
		type: String,
		default: 'Aspirante'
	},
	usuario: {
		type: String,
		required: true,
		unique: [true, {message: 'Usuario no disponible' }]
	},
	contrasena: {
		type: String,
		required: true
	},
});

usuarioSchema.plugin(uniqueValidator, { message: 'El valor indicado en {PATH} no esta disponible' });

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario