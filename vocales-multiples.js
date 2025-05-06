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
  A: ["A", "E", "I"],
  E: ["E", "I", "O", "U"],
  I: ["I", "O"],
  O: ["O", "U", "A", "E"],
  U: ["U", "A", "I", "O", "E"],	
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

async function detectar() {
  if (!gestureRecognizer || yaReconocida) return;
    const prediction = await gestureRecognizer.recognizeForVideo(
      videoElement,
      performance.now()
    );

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
    }


export async function empezarJuego() {
  document.getElementById("contenido-inicial").classList.add("hidden");
  document.getElementById("seccion-camara").classList.remove("hidden");

  await iniciarCamara(); // encender cámara al dar click
  iniciarRonda();
}

function iniciarRonda() {
  if (!iniciarRonda.vocalesRestantes || iniciarRonda.vocalesRestantes.length === 0) {
    iniciarRonda.vocalesRestantes = [...vocales]; 
  }

  const randomIndex = Math.floor(Math.random() * iniciarRonda.vocalesRestantes.length);
  vocalActual = iniciarRonda.vocalesRestantes.splice(randomIndex, 1)[0];
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
  contenedor.innerHTML = ""; 

  if (!irAEjercicios.vocalesRestantes || irAEjercicios.vocalesRestantes.length === 0) {
    irAEjercicios.vocalesRestantes = [...vocales];
  }

  const randomIndex = Math.floor(Math.random() * irAEjercicios.vocalesRestantes.length);
  const vocalRandom = irAEjercicios.vocalesRestantes.splice(randomIndex, 1)[0];

  const opciones = ejercicios[vocalRandom];
  opciones.forEach((opcion) => {
    const img = document.createElement("img");
    img.src = `./Assets/${opcion}-Sena.png`;
    img.alt = opcion;
    img.width = 150;
    img.onclick = () => validarRespuesta(opcion === vocalRandom, img);
    contenedor.appendChild(img);
  });

  document.querySelector(
    ".texto-seleccionar-sena"
  ).textContent = `Selecciona la seña correcta para la vocal: ${vocalRandom}`;
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
  if (botonContinuar) {
    botonContinuar.addEventListener("click", irAEjercicios);
  } 
  await iniciarReconocedor(); // solo una vez
});
