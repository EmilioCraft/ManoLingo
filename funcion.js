let yaSeleccionado = false;

function validarRespuesta(correcta, elemento) {
  if (yaSeleccionado && correcta) return;

  const mensaje = document.getElementById("mensaje-ejercicio");
  if (correcta) {
    yaSeleccionado = true;
    mensaje.textContent = "¡Correcto! 🎉";
    mensaje.style.color = "green";
    setTimeout(() => {
      document.getElementById("seccion-ejercicios").classList.add("hidden");
      document
        .getElementById("seccion-felicitaciones")
        .classList.remove("hidden");
    }, 1500);
  } else {
    mensaje.textContent = "Incorrecto 😅. Sigue intentando.";
    mensaje.style.color = "red";
  }
}

async function irACamara() {
  document.getElementById("seccion-intro").classList.add("hidden");
  document.getElementById("seccion-camara").classList.remove("hidden");

  await new Promise((r) => setTimeout(r, 100));

  const modulo = await import("./app.js");
  modulo.iniciarReconocimiento(); // Asegúrate que esta función esté exportada en app.js
}

function irAEjercicios() {
  document.getElementById("seccion-camara").classList.add("hidden");
  document.getElementById("seccion-ejercicios").classList.remove("hidden");
}
