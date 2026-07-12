require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const multer = require("multer");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("../"));

const upload = multer({
  storage: multer.memoryStorage()
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


app.post("/receta", async (req,res)=>{

try{

const {ingredientes,tipo,perfil}=req.body;

const respuesta=await groq.chat.completions.create({

model:"llama-3.1-8b-instant",

messages:[
{
role:"system",
content:"Eres Chef IA, un chef profesional."
},
{
role:"user",
content:`Crea una receta ${tipo} usando:

${ingredientes}


Personaliza la receta según este perfil:

🎯 Objetivo:
${perfil?.objetivo || "sin preferencia"}

🍽️ Alimentación:
${perfil?.alimentacion || "normal"}

⏱️ Tiempo disponible:
${perfil?.tiempo || "sin límite"}


Adapta los ingredientes, la preparación y los consejos según estas preferencias.

Usa este formato:

🍽️ Nombre del plato:

⏱️ Tiempo de preparación:

👥 Porciones:

🥗 Ingredientes:

👨‍🍳 Preparación paso a paso:

Escribe la receta sin usar **, *, # ni ningún formato Markdown. Usa viñetas (•) para los ingredientes, numera los pasos como 1., 2., 3. y deja una línea en blanco entre cada sección para facilitar la lectura.

Paso 1:
Paso 2:
Paso 3:

📊 Información nutricional aproximada:

🔥 Calorías:
💪 Proteínas:
🍞 Carbohidratos:
🥑 Grasas:


🧠 Análisis de la receta:

IMPORTANTE: Siempre incluye esta sección al final.

⭐ Dificultad: (Fácil, Media o Avanzada)

⏱️ Tiempo estimado: (Ejemplo: 30 minutos)

💰 Costo aproximado: (Económico, Moderado o Alto)

🥗 Tipo de alimentación: (Saludable, Proteica, Vegetariana u otro)


💡 Consejo del chef:`
}
]

});

let recetaFinal = respuesta.choices[0].message.content
  .replace(/\*\*/g, "")
  .replace(/\*/g, "");


if(!recetaFinal.includes("🧠 Análisis de la receta")){

recetaFinal += `


🧠 Análisis de la receta:

⭐ Dificultad: Fácil

⏱️ Tiempo estimado: 30 minutos

💰 Costo aproximado: Económico

🥗 Tipo de alimentación: Saludable


💡 Consejo del chef:
Disfruta esta receta y adapta los ingredientes a tu gusto.`;

}


res.json({
receta: recetaFinal
});


}catch(error){

console.error("🔥 ERROR RECETA REAL:", error.response?.data || error.message || error);
res.status(500).json({error:"Error receta"});

}

});



app.post("/analizar-imagen", upload.single("imagen"), async(req,res)=>{

console.log("📷 Petición de imagen recibida");


try{


if(!req.file){

console.log("❌ No llegó archivo");

return res.status(400).json({
error:"No hay imagen"
});

}


console.log(
"Imagen recibida:",
req.file.originalname,
req.file.mimetype,
req.file.size
);



const base64 =
req.file.buffer.toString("base64");



const respuesta =
await groq.chat.completions.create({

model:"meta-llama/llama-4-scout-17b-16e-instruct",

messages:[

{
role:"user",

content:[

{
type:"text",
text:"Identifica los alimentos visibles. Responde solamente con los ingredientes."
},

{
type:"image_url",
image_url:{
url:`data:${req.file.mimetype};base64,${base64}`
}

}

]

}

]

});


console.log(
"Respuesta IA:",
respuesta.choices[0].message.content
);



res.json({

ingredientes:
respuesta.choices[0].message.content

});


}catch(error){

console.log("ERROR VISION:",error);

res.status(500).json({
error:"Error analizando imagen"
});

}


});






app.post("/generar-imagen", async (req, res) => {

try {

const { prompt } = req.body;

const url =
"https://image.pollinations.ai/prompt/" +
encodeURIComponent(prompt + ", fotografía gastronómica profesional, plato gourmet servido en mesa elegante, iluminación de estudio, estilo revista culinaria, ultra realista, detalles nítidos, textura natural de los alimentos, profundidad de campo, lente 50mm, calidad 4K");

res.json({
imagen: url
});

} catch (error) {

console.log("ERROR IMAGEN:", error.message);

res.status(500).json({
error: "Error generando imagen"
});

}

});

app.listen(3000,()=>{

console.log("👨‍🍳 Chef IA servidor activo en puerto 3000");

});
