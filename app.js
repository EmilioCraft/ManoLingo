import { GestureRecognizer, FilesetResolver }
  from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let videoElement;
let resultadoSpan;

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
  if (!gestureRecognizer) return;

  const prediction = await gestureRecognizer.recognizeForVideo(
    videoElement,
    performance.now()
  );

  if (prediction && prediction.gestures.length > 0) {
    const vocalDetectada = prediction.gestures[0][0].categoryName;
    resultadoSpan.textContent = vocalDetectada;
    console.log("🔠 Vocal detectada:", vocalDetectada);
  } else {
    resultadoSpan.textContent = "Esperando...";
  }

  requestAnimationFrame(detectar);
}

// 👇 Esta es la función que se llamará desde el HTML
export async function iniciarReconocimiento() {
  videoElement = document.getElementById('webcam');
  resultadoSpan = document.getElementById('resultado');

  await iniciarCamara();
  await iniciarReconocedor();
  detectar();
}
