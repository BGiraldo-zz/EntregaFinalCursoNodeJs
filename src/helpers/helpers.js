const hbs = require('hbs');
const funciones = require('./funciones');

hbs.registerHelper('cursospararegistro', (cursosDisponibles) => {
    texto = `
         <div class="form-group">
             <label for="cursoselect">Curso</label>
                <select class="form-control" id="cursoselect" name="cursoid">`
    cursosDisponibles.forEach(curso => {
        texto = texto + `<option value="${curso.id}">${curso.nombre} - ID: ${curso.id}</option>`
    });
    texto = texto + `
                </select>
            </div>`
    return texto;
});

hbs.registerHelper('veraspirantes', (cursos, aspirantes) => {
    return funciones.veraspirantes(cursos, aspirantes);
});

hbs.registerHelper('listarCursos', (cursos) => {
    texto = `<table class="table">
    <thead class="thead-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th> 
          <th>Descripcion</th>
          <th>Valor</th>
          <th>Modalidad</th>
          <th>Intensidad</th>
          <th>Estado</th>
        </tr>
    </thead>`
    cursos.forEach(curso => {
        texto = texto + `
        <tr>
            <td>${curso.id}</td>
            <td>${curso.nombre}</td> 
            <td>${curso.descripcion}</td>
            <td>${curso.valor}</td>
            <td>${curso.modalidad}</td>
            <td>${curso.intensidad}</td>
            <td>${curso.estado}</td>
        </tr>`
    });
    texto = texto + `</table>`
    return texto;
});


hbs.registerHelper('selectCursos', (cursos) => {
    let cursosDisponibles = cursos.filter(curso => curso.estado != 'Cerrado');
    texto = `<form action="/cerrarcurso" method="POST">
     <div class="form-group">
         <label for="cursoselect">Curso</label>
            <select class="form-control" id="cursoselect" name="cursoid">`
    cursosDisponibles.forEach(curso => {
        texto = texto + `<option value="${curso.id}">${curso.nombre} - ID: ${curso.id}</option>`
    });
    texto = texto + `
            </select>
        </div>
        <button class="btn btn-primary" type="submit">Cerrar Curso</button>
    </form>`
    return texto;
});


hbs.registerHelper('listarCursosDisponibles', (cursosDisponibles) => {
    texto = `<div style="margin-left: 50px; display:flex; flex-flow:row wrap; justify-content: space-around;">`
    i = 0;
    cursosDisponibles.forEach(curso => {
        texto = texto + `
        <p>
            <button class="btn btn-primary" type="button" data-toggle="collapse" 
            data-target="#collap${i}" aria-expanded="false" aria-controls="#collap${i}">
              <p>Nombre: ${curso.nombre}</p>
              <p>Descripción: ${curso.descripcion}</p>
              <p>Valor: ${curso.valor} COP</p>
            </button>
        </p>
        <div class="collapse" id="collap${i}">
            <p>Descripción: ${curso.descripcion}</p>
            <p>Modalidad: ${curso.modalidad}</p>
            <p>Intensidad Horaria: ${curso.intensidad} Horas</p>
        </div>`
        i = i + 1;
    });
    texto = texto + `</div>`
    return texto;
});

hbs.registerHelper('selectUsuarios', (tipo, usuarios) => {
    seleccionados = usuarios;
    if (tipo === 'Cordinador') {
        usertype = 'Aspirante';
        seleccionados = usuarios.filter(user => user.tipo === usertype);
    } else if (tipo === 'Aspirante') {
        usertype = 'Cordinador';
        seleccionados = usuarios.filter(user => user.tipo === usertype);
    }
    texto = `
     <div class="form-group">
         <label for="usselect">${usertype}</label>
            <select class="form-control" id="usselect" name="usselect">`
    seleccionados.forEach(user => {
        texto = texto + `<option value="${user.id}">${user.nombre} - ID: ${user.id}</option>`
    });
    texto = texto + `
            </select>
        </div>`
    return texto;
});

hbs.registerHelper('vermensajes', (tipo, usuarios) => {
    seleccionados = usuarios;

    if (tipo === 'Cordinador') {
        seleccionados = usuarios.filter(user => user.tipo === 'Aspirante');
    } else if (tipo === 'Aspirante') {
        seleccionados = usuarios.filter(user => user.tipo === 'Cordinador');
    }
    texto = `<form id="chatpriv">
     <div class="form-group">
         <label for="usersel">Curso</label>
            <select class="form-control" id="usersel" name="usersel">`
    seleccionados.forEach(user => {
        texto = texto + `<option value="${user.id}">${user.nombre} - ID: ${user.id}</option>`
    });
    texto = texto + `
            </select>
        </div>
        <button class="btn btn-primary">Ver Mensajes</button>
    </form>
    <div id="chatprivado"></div>`
    return texto;
});