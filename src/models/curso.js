const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

const cursoSchema = new Schema({
	id : {
		type : Number,
		required : true,
		unique: true
	},
	nombre :{
		type : String,
		required : true
	},
	descripcion : {
		type : String,
		required : true	
	},
	valor : {
        type: Number,
        required : true,
		default: 0		
	},
	modalidad : {
        type: String,
		default: ''					
	},
	intensidad : {
        type: String,
		default: ''					
	},
	estado : {
        type: String,
		default: 'Disponible'					
	},
	cordinadorId : {
		type: Number,
		required: true
	}
});

cursoSchema.plugin(uniqueValidator,  { message: 'El valor indicado en {PATH} no esta disponible' } );

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso