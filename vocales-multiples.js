import {
  GestureRecognizer,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let videoElement;
let resultadoSpan;
let botonContinuar;
let vocalActual = "";
let yaReconocida = false;
let rondaActual = 0;

const vocales = ["A", "E", "I", "O", "U"];
const ejercicios = {
  A: ["A", "E"],
  E: ["E", "I"],
  I: ["I", "O"],
  O: ["O", "U"],
  U: ["U", "A"],
};

async function iniciarCamara() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    console.log("✅ Cámara iniciada");
  } catch (err) {
    console.error("❌ No se pudo acceder a la cámara", err);
  }
}

async function iniciarReconocedor() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "./Modelos/ModeloVocales.task",
    },
    runningMode: "VIDEO",
  });

  console.log("✅ Modelo cargado y listo");
}

function detectar() {
  if (!gestureRecognizer || yaReconocida) return;

  gestureRecognizer
    .recognizeForVideo(videoElement, performance.now())
    .then((prediction) => {
      const webcam = document.getElementById("webcam");

      if (prediction && prediction.gestures.length > 0) {
        const detectada = prediction.gestures[0][0].categoryName;

        if (detectada === vocalActual) {
          resultadoSpan.textContent = `¡${vocalActual} reconocida!`;
          yaReconocida = true;
          botonContinuar.disabled = false;
          webcam.classList.add("camara-reconocida");
          return;
        } else {
          webcam.classList.remove("camara-reconocida");
        }
      } else {
        resultadoSpan.textContent = "Esperando...";
        webcam.classList.remove("camara-reconocida");
      }

      requestAnimationFrame(detectar);
    });
}

export async function empezarJuego() {
  document.getElementById("contenido-inicial").classList.add("hidden");
  document.getElementById("seccion-camara").classList.remove("hidden");

  await iniciarCamara(); // encender cámara al dar click
  iniciarRonda();
}

function iniciarRonda() {
  vocalActual = vocales[rondaActual];
  yaReconocida = false;
  botonContinuar.disabled = true;
  resultadoSpan.textContent = "Esperando...";

  document.getElementById("seccion-camara").dataset.vocal = vocalActual;
  document.querySelector(
    ".dialogo-cam"
  ).textContent = `¡Ahora intenta hacer la vocal ${vocalActual}!`;
  document.querySelector(
    ".textocam"
  ).textContent = `Reconocimiento de la vocal ${vocalActual}`;

  detectar();
}

export function irAEjercicios() {
  document.getElementById("seccion-camara").classList.add("hidden");
  document.getElementById("seccion-ejercicios").classList.remove("hidden");

  const contenedor = document.querySelector(".seleccion-ejercicio");
  contenedor.innerHTML = ""; // limpia antes

  const opciones = ejercicios[vocalActual];
  opciones.forEach((opcion) => {
    const img = document.createElement("img");
    img.src = `./Assets/${opcion}-Sena.png`;
    img.alt = opcion;
    img.width = 150;
    img.onclick = () => validarRespuesta(opcion === vocalActual, img);
    contenedor.appendChild(img);
  });

  document.getElementById("mensaje-ejercicio").textContent = "";
}

function validarRespuesta(correcta, imgElemento) {
  const mensaje = document.getElementById("mensaje-ejercicio");
  if (correcta) {
    mensaje.textContent = "✅ ¡Correcto!";
    setTimeout(irASiguienteRonda, 2000);
  } else {
    mensaje.textContent = "❌ Intenta de nuevo";
    imgElemento.classList.add("respuesta-incorrecta");
    setTimeout(() => {
      imgElemento.classList.remove("respuesta-incorrecta");
      mensaje.textContent = "";
    }, 1500);
  }
}

function irASiguienteRonda() {
  rondaActual++;

  if (rondaActual < vocales.length) {
    document.getElementById("seccion-ejercicios").classList.add("hidden");
    document.getElementById("seccion-camara").classList.remove("hidden");
    iniciarRonda();
  } else {
    document.getElementById("seccion-ejercicios").classList.add("hidden");
    document.getElementById("seccion-final").classList.remove("hidden");
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  videoElement = document.getElementById("webcam");
  resultadoSpan = document.getElementById("resultado");
  botonContinuar = document.getElementById("btn-continuar");

  await iniciarReconocedor(); // solo una vez
});
