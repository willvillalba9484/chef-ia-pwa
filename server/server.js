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

const respuesta = await groq.chat.completions.create({

model:"meta-llama/llama-4-scout-17b-16e-instruct",

messages:[
{
role:"system",
content:"Eres Chef IA, un chef profesional."
},
{
role:"user",
content:`Crea una receta ${tipo || ""} usando:

${ingredientes}

Personaliza la receta según este perfil:

Objetivo: ${perfil?.objetivo || "Sin preferencia"}
Alimentación: ${perfil?.alimentacion || "Normal"}
Tiempo disponible: ${perfil?.tiempo || "Sin límite"}

Responde con una receta completa usando este formato:

🍽️ Nombre de la receta

⏱️ Tiempo: XX minutos

👥 Porciones: X

🥗 Ingredientes

• Ingrediente 1
• Ingrediente 2
• Ingrediente 3

👨‍🍳 Preparación

1. Primer paso.
2. Segundo paso.
3. Tercer paso.

🧠 Análisis de la receta

⭐ Dificultad:
💡 Beneficios:
⏱️ Tiempo estimado:
💰 Costo aproximado:
🥗 Tipo de alimentación:
👨‍🍳 Consejo del chef:

🥗 Información nutricional

🔥 Calorías:
💪 Proteínas:
🥑 Grasas:
🌾 Carbohidratos:

Es obligatorio completar todas las secciones, incluyendo "🧠 Análisis de la receta" y "🥗 Información nutricional". No omitas ninguna sección y no agregues texto antes ni después de la receta.`
}
]

});


let receta = respuesta.choices[0].message.content.trim();

if (!receta.includes("⭐ Dificultad:")) {
receta += `

🧠 Análisis de la receta

⭐ Dificultad: Media
💡 Beneficios: Receta equilibrada y adecuada según los ingredientes seleccionados.
⏱️ Tiempo estimado: 20-30 minutos
💰 Costo aproximado: Económico
🥗 Tipo de alimentación: Equilibrada
👨‍🍳 Consejo del chef: Prueba la sazón antes de servir y ajusta sal o especias al gusto.
`;
}

if (!receta.includes("🥗 Información nutricional")) {
receta += `

🥗 Información nutricional

🔥 Calorías: Aproximadas.
💪 Proteínas: Aproximadas.
🥑 Grasas: Aproximadas.
🌾 Carbohidratos: Aproximados.`;
}

console.log("========== RECETA ==========");
console.log(receta);
console.log("============================");

res.json({
receta
});


}catch(error){

console.error("🔥 ERROR RECETA REAL:", error.response?.data || error.message || error);

res.status(500).json({
error:"Error receta"
});

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
