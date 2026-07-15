const API = "https://chef-ia-pwa.onrender.com";
const boton = document.getElementById("generar");
const camara = document.getElementById("camara");
const galeria = document.getElementById("galeria");
const ingredientes = document.getElementById("ingredientes");
const resultado = document.getElementById("resultado");
const analisisImagen = document.getElementById("analisisImagen");

const listaFavoritos = document.getElementById("listaFavoritos");
const listaHistorial = document.getElementById("listaHistorial");

const vistaImagen = document.getElementById("vistaImagen");

const objetivo =
document.getElementById("objetivo");

const alimentacion =
document.getElementById("alimentacion");

const tiempo =
document.getElementById("tiempo");

const guardarPerfil =
document.getElementById("guardarPerfil");


guardarPerfil.addEventListener("click",()=>{

const perfil = {

objetivo:objetivo.value,

alimentacion:alimentacion.value,

tiempo:tiempo.value

};


localStorage.setItem(
"perfilChef",
JSON.stringify(perfil)
);


alert("👤 Perfil guardado");

});



const perfilGuardado =
JSON.parse(localStorage.getItem("perfilChef"));


if(perfilGuardado){

objetivo.value =
perfilGuardado.objetivo;

alimentacion.value =
perfilGuardado.alimentacion;

tiempo.value =
perfilGuardado.tiempo;

}




// -------- CÁMARA --------

camara.addEventListener("change", async()=>{

const imagen = camara.files[0];

if(!imagen) return;


vistaImagen.src =
URL.createObjectURL(imagen);


const formulario = new FormData();

formulario.append("imagen",imagen);


analisisImagen.innerHTML =
"📷 Analizando ingredientes...";


try{

const respuesta =
await fetch(
API + "/analizar-imagen",
{
method:"POST",
body:formulario
}
);


const datos =
await respuesta.json();


ingredientes.value =
datos.ingredientes;


analisisImagen.innerHTML =
`
✅ Ingredientes detectados:

<p>${datos.ingredientes}</p>

<button id="usarIngredientes">
🍳 Generar receta con estos ingredientes
</button>
`;


document
.getElementById("usarIngredientes")
.addEventListener("click",()=>{

boton.click();

});


}catch(error){

console.log("ERROR:", error);

analisisImagen.innerHTML =
"❌ Error analizando imagen";

}

});
galeria.addEventListener("change", async () => {

const imagen = galeria.files[0];

if(!imagen) return;

vistaImagen.src = URL.createObjectURL(imagen);

const formulario = new FormData();

formulario.append("imagen", imagen);

analisisImagen.innerHTML = "📷 Analizando ingredientes...";

try{

const respuesta = await fetch(
API + "/analizar-imagen",
{
method:"POST",
body:formulario
}
);

const datos = await respuesta.json();

ingredientes.value = datos.ingredientes;

analisisImagen.innerHTML = `
✅ Ingredientes detectados:

<p>${datos.ingredientes}</p>

<button id="usarIngredientes">
🍳 Generar receta con estos ingredientes
</button>
`;

document.getElementById("usarIngredientes")
.addEventListener("click",()=>{
boton.click();
});

}catch(error){

analisisImagen.innerHTML = "❌ Error analizando imagen";

}

});



// -------- FAVORITOS --------


function cargarFavoritos(){

let favoritos =
JSON.parse(localStorage.getItem("favoritos")) || [];

listaFavoritos.innerHTML="";


favoritos.forEach((receta,index)=>{

let div=document.createElement("div");

div.innerHTML=
`
<hr>

<p>
${formatearReceta(receta.replace(/\*/g,"")).replace(/\n/g,"<br>")}
</p>

<button onclick="eliminarFavorito(${index})">
🗑️ Eliminar
</button>

`;

listaFavoritos.appendChild(div);

});

}



function guardarFavorito(receta){

let favoritos =
JSON.parse(localStorage.getItem("favoritos")) || [];


favoritos.unshift(receta);


localStorage.setItem(
"favoritos",
JSON.stringify(favoritos)
);


cargarFavoritos();

}



function eliminarFavorito(index){

let favoritos =
JSON.parse(localStorage.getItem("favoritos")) || [];


favoritos.splice(index,1);


localStorage.setItem(
"favoritos",
JSON.stringify(favoritos)
);


cargarFavoritos();

}


window.eliminarFavorito =
eliminarFavorito;




// -------- HISTORIAL --------


function cargarHistorial(){

let historial =
JSON.parse(localStorage.getItem("historial")) || [];


listaHistorial.innerHTML="";


historial.forEach((receta,index)=>{


let div=document.createElement("div");


div.innerHTML=
`
<hr>

<p>
${formatearReceta(receta.replace(/\*/g,"")).replace(/\n/g,"<br>")}
</p>


<button onclick="eliminarHistorial(${index})">
🗑️ Eliminar
</button>

`;


listaHistorial.appendChild(div);


});


}



function guardarHistorial(receta){

let historial =
JSON.parse(localStorage.getItem("historial")) || [];


historial.unshift(receta);


historial =
historial.slice(0,10);


localStorage.setItem(
"historial",
JSON.stringify(historial)
);


cargarHistorial();

}



function eliminarHistorial(index){

let historial =
JSON.parse(localStorage.getItem("historial")) || [];


historial.splice(index,1);


localStorage.setItem(
"historial",
JSON.stringify(historial)
);


cargarHistorial();

}


window.eliminarHistorial =
eliminarHistorial;




// -------- IMAGEN DEL PLATO (con spinner, timeout y reintentar) --------


function generarImagenPlato(prompt){

const contenedor = document.getElementById("imagenReceta");

if(!contenedor) return;

contenedor.innerHTML = `
<div class="spinner"></div>
<p style="text-align:center;color:#777;">🖼️ Generando imagen del plato...</p>
`;

const controlador = new AbortController();

const tiempoLimite = setTimeout(()=>{
controlador.abort();
}, 20000);

fetch(API + "/generar-imagen",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({ prompt }),
signal: controlador.signal
})
.then(r=>r.json())
.then(data=>{

clearTimeout(tiempoLimite);

const img = new Image();

img.src = data.imagen;
img.style.width = "100%";
img.style.borderRadius = "15px";

img.onload = ()=>{
contenedor.innerHTML = "";
contenedor.appendChild(img);
};

img.onerror = ()=>{
mostrarErrorImagen(prompt);
};

})
.catch(error=>{

clearTimeout(tiempoLimite);

console.log("ERROR IMAGEN:", error);

mostrarErrorImagen(prompt);

});

}


function mostrarErrorImagen(prompt){

const contenedor = document.getElementById("imagenReceta");

if(!contenedor) return;

contenedor.innerHTML = `
<p style="text-align:center;color:#c0392b;">❌ La imagen tardó demasiado o no se pudo generar.</p>
<button id="reintentarImagen">🔄 Reintentar</button>
`;

document
.getElementById("reintentarImagen")
.addEventListener("click",()=>{
generarImagenPlato(prompt);
});

}



// -------- FORMATEAR RECETA (negrita en encabezados clave) --------

function formatearReceta(texto){

const encabezados = [
"🥗 Ingredientes",
"👨‍🍳 Preparación",
"🧠 Análisis de la receta",
"🥗 Información nutricional"
];

return texto
.split("\n")
.map(linea=>{

const limpia = linea.trim();

if(limpia.startsWith("🍽️")){
return `<strong>${linea}</strong>`;
}

if(encabezados.includes(limpia)){
return `<strong>${linea}</strong>`;
}

return linea;

})
.join("\n");

}



// -------- GENERAR RECETA --------


boton.addEventListener("click",async()=>{


const texto =
ingredientes.value.trim();


if(!texto){

resultado.innerHTML =
"⚠️ No hay ingredientes";

return;

}



resultado.innerHTML =
"👨‍🍳 Creando receta...";

resultado.scrollIntoView({behavior:"smooth", block:"start"});


try{


const respuesta =
await fetch(
API + "/receta",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({
    ingredientes:texto,
    tipo:"",
    perfil:{
        objetivo:objetivo.value,
        alimentacion:alimentacion.value,
        tiempo:tiempo.value
    }
})

});


const datos =
await respuesta.json();



guardarHistorial(datos.receta.replace(/\*+/g,""));



resultado.innerHTML =
`
<div style="text-align:left!important;">

<h2 style="text-align:left!important;font-weight:900!important;margin:0 0 15px 0;">
🍽️ Receta
</h2>

<div id="imagenReceta">
<div class="spinner"></div>
<p style="text-align:center;color:#777;">🖼️ Generando imagen del plato...</p>
</div>

<div style="
text-align:left!important;
font-size:17px;
line-height:1.8;
white-space:pre-wrap;
font-family:Arial,sans-serif;
">

<pre style="
text-align:left!important;
white-space:pre-wrap;
font-family:Arial,sans-serif;
font-size:17px;
line-height:1.8;
margin:0;
">${formatearReceta(datos.receta.replace(/\*/g,"").trim())}</pre>

</div>

</div>


<div class="botones-receta" style="text-align:center!important;">

<button id="guardar" style="text-align:center!important;">
❤️ Guardar favorita
</button>

<button id="compartir" style="text-align:center!important;">
📤 Compartir receta
</button>

<button id="escuchar" style="text-align:center!important;">
🔊 Escuchar receta
</button>

<button id="modoCocina" style="text-align:center!important;">
👨‍🍳 Iniciar modo cocina
</button>

</div>

`;

generarImagenPlato(`Foto realista del plato preparado: ${datos.receta}`);

document
.getElementById("guardar")
.addEventListener("click",()=>{

guardarFavorito(datos.receta);

alert("❤️ Receta guardada");

});


document
.getElementById("compartir")
.addEventListener("click", async()=>{

if(navigator.share){

await navigator.share({

title:"👨‍🍳 Chef IA",

text:datos.receta

});

}else{

alert("Compartir no está disponible en este dispositivo");

}

});


document
.getElementById("escuchar")
.addEventListener("click",()=>{

const voz =
new SpeechSynthesisUtterance(datos.receta);

voz.lang="es-ES";

voz.rate=0.9;

speechSynthesis.speak(voz);

});


document
.getElementById("modoCocina")
.addEventListener("click",()=>{

localStorage.setItem(
"recetaActual",
datos.receta
);


const seccionPreparacion =
datos.receta.match(/👨‍🍳 Preparación([\s\S]*?)(🧠 Análisis de la receta|$)/);

const textoPasos =
seccionPreparacion ? seccionPreparacion[1] : datos.receta;

const pasos =
textoPasos
.split(/\n?\d+\.\s+/)
.map(p=>p.trim())
.filter(p=>p.length>0);


let pasoActual = 0;


function mostrarPaso(){

resultado.innerHTML = `

<h2>👨‍🍳 Modo Cocina</h2>

<h3>
Paso ${pasoActual + 1} de ${pasos.length}
</h3>


<p>
${pasos[pasoActual]}
</p>


<button id="anterior">
⬅️ Anterior
</button>


<button id="siguiente">
Siguiente ➡️
</button>


<h3>⏱️ Temporizador</h3>

<p id="tiempo">
05:00
</p>


<button id="iniciarTiempo">
▶️ Iniciar
</button>


<button id="reiniciarTiempo">
🔄 Reiniciar
</button>


`;



document
.getElementById("anterior")
.onclick=()=>{

if(pasoActual>0){

pasoActual--;

mostrarPaso();

}

};



document
.getElementById("siguiente")
.onclick=()=>{

if(pasoActual<pasos.length-1){

pasoActual++;

mostrarPaso();

}

};



let segundos = 300;

let intervalo;


document
.getElementById("iniciarTiempo")
.onclick=()=>{


clearInterval(intervalo);


intervalo=setInterval(()=>{


if(segundos>0){

segundos--;


let minutos =
Math.floor(segundos/60);


let resto =
segundos%60;


document.getElementById("tiempo").innerHTML =

String(minutos).padStart(2,"0")
+
":"
+
String(resto).padStart(2,"0");


}else{

clearInterval(intervalo);

alert("⏰ Tiempo terminado");

}


},1000);


};



document
.getElementById("reiniciarTiempo")
.onclick=()=>{


clearInterval(intervalo);


segundos=300;


document.getElementById("tiempo").innerHTML="05:00";


};

}


mostrarPaso();

resultado.scrollIntoView({behavior:"smooth", block:"start"});

});


}catch(error){


console.log(error);


resultado.innerHTML =
"❌ Error generando receta";

}


});



cargarFavoritos();
cargarHistorial();


// Service Worker desactivado temporalmente

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker activo"))
      .catch((error) => console.log("Error Service Worker:", error));
  });
}
window.addEventListener("load", () => {
  const pantalla = document.getElementById("pantallaCarga");
  if (pantalla) {
    pantalla.style.opacity = "0";
    pantalla.style.transition = "opacity 0.4s ease";

    setTimeout(() => {
      pantalla.remove();
    }, 400);
  }
});
