import {
  GestureRecognizer,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let videoElement;
let resultadoSpan;
let botonContinuar;
let aYaReconocida = false;

async function iniciarCamara() {
  const constraints = { video: true, audio: false };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
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

const seccionCamara = document.getElementById("seccion-camara");
const vocalEsperada = seccionCamara.dataset.vocal;

async function detectar() {
  if (!gestureRecognizer || aYaReconocida) return;

  const prediction = await gestureRecognizer.recognizeForVideo(
    videoElement,
    performance.now()
  );

  const webcam = document.getElementById("webcam");

  if (prediction && prediction.gestures.length > 0) {
    const vocalDetectada = prediction.gestures[0][0].categoryName;

    if (vocalDetectada === vocalEsperada) {
      resultadoSpan.textContent = `¡${vocalEsperada} reconocida!`;
      aYaReconocida = true;
      botonContinuar.disabled = false;
      webcam.classList.add("camara-reconocida"); // cambia a verde
      return;
    } else {
      webcam.classList.remove("camara-reconocida"); // sigue en rojo
    }
  } else {
    resultadoSpan.textContent = "Esperando...";
    webcam.classList.remove("camara-reconocida"); // sigue en rojo
  }

  requestAnimationFrame(detectar);
}

export async function iniciarReconocimiento() {
  videoElement = document.getElementById("webcam");
  resultadoSpan = document.getElementById("resultado");
  botonContinuar = document.getElementById("btn-continuar");

  await iniciarCamara();
  await iniciarReconocedor();
  detectar();
}
