var dateControl = document.querySelector('input[type="date"]')
var geolimit = document.getElementById('sellimit')
var lista = document.getElementById('lista')
var btnConsultar = document.getElementById('btnConsultar')
var maxmin = document.getElementById('maxmin')

// var minimo = document.getElementById('minimo')
// var medio = document.getElementById('medio')
// var maximo = document.getElementById('maximo')

// --Registrar el Service Worker--
// const swLocation = "swtarifaluz.js";
// if (navigator.serviceWorker) {
// 	if (window.location.href.includes("localhost")) swLocation = "/swtarifaluz.js";
// 	//Varia según el host
// 	navigator.serviceWorker.register(swLocation);
// } else {
// 	console.log("no se ha podido registrar el SW " + navigator.serviceWorker)
// }


const fecha = new Date();
dateControl.value = fecha.toJSON().slice(0, 10);

geolimit.addEventListener("click", (event) => {
	event.preventDefault();
	lista.innerHTML = '';
	maxmin.innerHTML = '';
});
dateControl.addEventListener("click", (event) => {
	lista.innerHTML = '';
	maxmin.innerHTML = '';
});

btnConsultar.addEventListener("click", (event) => {
	event.preventDefault();
	// console.log('click boton xxx');
	// console.log(dateControl.value);
	const startdate = dateControl.value + "T00:00";
	const enddate = dateControl.value + "T23:59";
	cargarPrecios(startdate, enddate);
});



const cargarPrecios = async (startdate, enddate) => {
	try {
		mostrarLoading();
		let imagen = '';
		lista.innerHTML = ''
		// maxmin.innerHTML = '';
		// console.log(geolimit.value)
		// console.log(startdate)
		// console.log(enddate)
		const apirest = `https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${startdate}&end_date=${enddate}&geo_limit=${geolimit.value}&time_trunc=hour`

		// console.log(apirest)


		const respuesta = await fetch(apirest);

		// console.log(respuesta.status);
		//		console.log(respuesta);

		// Si la respuesta es correcta
		if (respuesta.status === 200) {
			const datos = await respuesta.json();
			let precios = [];
			datos.included[0].attributes.values.forEach(precio => {
				precios.push((precio.value / 1000).toFixed(5));
			});
			// console.log(precios)
			let min = Math.min(...precios);
			let max = Math.max(...precios);
			let med = (min + max) / 2;
			//med = Math.round(med * 100000) / 100000
			//med = +(Math.round(med + "e+5") + "e-5")
			//med = med.toFixed(5)
			med = (Math.round(med *1000000) / 1000000).toPrecision(5)
			let cuarto = (+med + min) / 2;
			 console.log(min)
			 console.log(max)
			 console.log(med)
			 console.log(cuarto)
			let minimoMaximo = `
			<div id="minimo" class="verde"><p>MÍNIMO</p> <p>${min} €/kwh</p></div>
			<div id="medio"><p>MEDIA</p> <p>${med} €/kwh</p></div>
			<div id="maximo"><p>MÁXIMO</p> <p>${max} €/kwh</p></div>`;
			maxmin.innerHTML = minimoMaximo;
			// minimo.innerHTML = "Mínimo " + min + " €/kwh";
			// medio.innerHTML = "Medio " + med + " €/kwh";
			// maximo.innerHTML = "Máximo " + max + " €/kwh";

			//  console.log(datos);
			// console.log(datos.included[0].attributes.values[0].datetime + ": " + datos.included[0].attributes.values[0].value);
			let preciosHora = '';
			//			const datos1 = await datos.included[0].json();
			// console.log(datos.included[0].attributes.values);



			let horanext = ''	

			datos.included[0].attributes.values.forEach(hora => {
			// console.log(hora.datetime.slice(11))
			// console.log(hora.datetime.slice(11,13))
				let valor = (hora.value / 1000).toFixed(5);
				if (valor < cuarto) {
					imagen = './img/cuadradoVerde.png'
				} else if (valor < med) {
					imagen = './img/cuadradoNaranja.png'
				} else {
					imagen = './img/puntorojo.png'
				}
			horanext = +hora.datetime.slice(11, 13) + 1	
			// console.log('antes: ' + horanext + ' ' + ((String(horanext)).length))
			if ( (String(horanext).length) == 1) { 
				horanext = '0' + horanext}	
			// console.log('desp: ' + horanext)

				preciosHora += `
			<div class="itempreciohora">
				<img src="${imagen}">
				<span> ${hora.datetime.slice(11, 13)}h-${horanext}h: ${(hora.value / 1000).toFixed(5)} €/kWh </span>
			</div>`;
			});

			ocultarLoading();
			document.getElementById('lista').innerHTML = preciosHora;

		} else if (respuesta.status === 401) {
			lista.innerHTML = 'Precios no encontrados';
			// console.log('Precios no encontrados');
		} else if (respuesta.status === 404) {
			ocultarLoading();
			lista.innerHTML = 'Precios no encontrados';
			// console.log('Precios no encontrados');
		} else if (respuesta.status === 502) {
			ocultarLoading();
			lista.innerHTML = 'No hay datos para los filtros seleccionados.'
			// console.log('No hay datos para los filtros seleccionados.');
		} else {
			ocultarLoading();
			lista.innerHTML = 'Hubo un error y no sabemos que paso';
			// console.log('Hubo un error y no sabemos que paso');
		}

	} catch (error) {
		console.log(error);
	}

}
function ocultarLoading() {
	document.getElementById("loading").style.display = "none";
}
function mostrarLoading() {
	document.getElementById("loading").style.display = "block";
}
