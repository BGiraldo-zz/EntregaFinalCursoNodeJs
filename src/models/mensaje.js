const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mensajeSchema = new Schema({
	transmitterid : {
		type : Number
	},
	receiverid :{
		type : Number
	},
	texto : {
		type : String,
		required : true	
    },
    isadminmessage : {
		type : Boolean,
        required : true,
        default: false
    },
    date: {
        type: String,
        required: true,
        default: new Date().toDateString()
    },
    nombre: {
        type : String
    }
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

module.exports = Mensaje