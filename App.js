const boton = document.getElementById("generar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", () => {
    const ingredientes = document.getElementById("ingredientes").value.trim();

    if (!ingredientes) {
        resultado.innerHTML = "⚠️ Escribe al menos un ingrediente.";
        return;
    }

    resultado.innerHTML =
`🧑‍🍳 Ingredientes:

${ingredientes}

✅ ¡Perfecto!

En el siguiente paso conectaremos Chef IA con Groq para generar una receta real.`;
});
