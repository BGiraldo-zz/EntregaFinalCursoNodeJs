const obtenerAspirantesCurso = (cursoid, aspirantes) => {
    var aspirantesEnCurso = aspirantes.filter(aspi => aspi.cursos.includes(cursoid));
    tablaAspirantes = `
    <table class="table">
    <thead class="thead-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th> 
          <th>Email</th>
          <th>Telefono</th>
          <th>Quitar</th>
        </tr>
    </thead>`
    var x = 0;
    aspirantesEnCurso.forEach(aspc => {
        tablaAspirantes = tablaAspirantes + `
        <tr>
            <td>${aspc.id}</td>
            <td>${aspc.nombre}</td> 
            <td>${aspc.email}</td>
            <td>${aspc.telefono}</td>
            <td>
            <form action="/desinscribir" method="POST">
                    <input type="number" style="display:none;visibility:hidden;" name="cursoid" value="${cursoid}"></input>
                    <input type="number" style="display:none;visibility:hidden;" name="aspiranteid" value="${aspc.id}"></input>
                    <input type="number" style="display:none;visibility:hidden;" name="pos" value="${x}"></input>
                    <button type="submit" class="btn btn-danger">Eliminar</button>
             </form>
            </td>
        </tr>`
        x += 1
    });
    tablaAspirantes = tablaAspirantes + `</table>`
    return tablaAspirantes;
}

const veraspirantes = (cursos, aspirantes) => {
    let cursosDisponibles = cursos.filter(curso => curso.estado != 'Cerrado');
    htmlCursoAspirantes = `<div style="margin-left: 50px; display:flex; flex-flow:row wrap; justify-content: space-around;">`
    i = 0;
    cursosDisponibles.forEach(curso => {
        let aspirantesEnCurso = obtenerAspirantesCurso(curso.id, aspirantes);
        htmlCursoAspirantes = htmlCursoAspirantes + `
        <p>
            <button class="btn btn-primary" type="button" data-toggle="collapse" 
            data-target="#colla${i}" aria-expanded="false" aria-controls="#colla${i}">
              <p>${curso.nombre} ID:${curso.id}</p>
            </button>
        </p>
        <div class="collapse" id="colla${i}">` +
            aspirantesEnCurso +
            `</div>`
        i = i + 1;
    });

    htmlCursoAspirantes = htmlCursoAspirantes + `</div>`
    return htmlCursoAspirantes;
}

module.exports = {
    veraspirantes
}