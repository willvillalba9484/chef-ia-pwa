require("dotenv").config();

const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


async function probar(){

const imagen = fs.readFileSync("test.jpg");

const base64 = imagen.toString("base64");


const respuesta =
await groq.chat.completions.create({

model:
"meta-llama/llama-4-scout-17b-16e-instruct",

messages:[

{
role:"user",

content:[

{
type:"text",
text:"¿Qué alimentos aparecen en esta imagen?"
},

{
type:"image_url",
image_url:{
url:
`data:image/jpeg;base64,${base64}`
}

}

]

}

]

});


console.log(
respuesta.choices[0].message.content
);

}


probar();
