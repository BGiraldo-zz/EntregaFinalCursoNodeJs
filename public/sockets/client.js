socket = io()

const mensajeprivado = document.querySelector('#mensajeprivado')
const msjprivado= mensajeprivado.querySelector('#msjprivado')

mensajeprivado.addEventListener('submit', (datos) => {
	receiverid = document.querySelector('#usselect').value;	
	datos.preventDefault()
	socket.emit('textopriv', msjprivado.value, receiverid, () => {			
		msjprivado.value = ''
		msjprivado.focus()
			}
		)
	alert('Mensaje Enviado Correctamente');
})

const chatpriv = document.querySelector('#chatpriv')

chatpriv.addEventListener('submit', (datos) => {	
	receiverid1 = document.getElementById("usersel").value;
	datos.preventDefault()
	socket.emit('showprivchat', receiverid1)
})

const chatprivado= document.querySelector('#chatprivado')
socket.on("showmsjpriv", (text) =>{
	chatprivado.innerHTML = '';
	chatprivado.innerHTML  = chatprivado.innerHTML + text + '<br>'
})