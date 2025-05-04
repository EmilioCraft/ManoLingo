import { GestureRecognizer, FilesetResolver }
  from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

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
    runningMode: "VIDEO"
  });

  console.log("✅ Modelo cargado y listo");
}

async function detectar() {
  if (!gestureRecognizer || aYaReconocida) return;

  const prediction = await gestureRecognizer.recognizeForVideo(
    videoElement,
    performance.now()
  );

  if (prediction && prediction.gestures.length > 0) {
    const vocalDetectada = prediction.gestures[0][0].categoryName;

    if (vocalDetectada === "A") {
      resultadoSpan.textContent = "¡A reconocida!";
      aYaReconocida = true;
      botonContinuar.disabled = false;
      return; // Ya no seguir detectando
    }
  } else {
    resultadoSpan.textContent = "Esperando...";
  }

  requestAnimationFrame(detectar);
}

export async function iniciarReconocimiento() {
  videoElement = document.getElementById('webcam');
  resultadoSpan = document.getElementById('resultado');
  botonContinuar = document.getElementById('btn-continuar');

  await iniciarCamara();
  await iniciarReconocedor();
  detectar();
}
