socket = io()

const mensajegeneral = document.querySelector('#mensajegeneral')
const msjgeneral = mensajegeneral.querySelector('#msjgeneral')
const chatgeneral = document.querySelector('#chatgeneral')

mensajegeneral.addEventListener('submit', (datos) => {	
	datos.preventDefault()
	socket.emit('texto', msjgeneral.value, () => {			
		msjgeneral.value = ''
		msjgeneral.focus()
			}
		)
})

socket.on("connect",() =>{
	socket.emit('usuarioNuevo')
});

socket.on("texto", (text) =>{
	chatgeneral.innerHTML  = chatgeneral.innerHTML + text + '<br>'
	alert('Mensaje Enviado Correctamente');
})