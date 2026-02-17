let detector = null;
let video = null;
let isDetecting = false;
let sendHandsCallback = null;

/**
 * @param {HTMLVideoElement} videoElement  //video element to display webcam feed
 * @param {Function} sendHands //callback function to send detected hand positions to main.js
 */
async function setupHandTracking(videoElement, sendHands){ //initialise webcam + hand tracking model
  video = videoElement;
  sendHandsCallback = sendHands;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ //request webcam access
    video: {width: 640, height: 480},
    });
    video.srcObject = stream; //connect webcam stream to video element
    await video.play();
    const model = window.handPoseDetection.SupportedModels.MediaPipeHands; //load hand detection model
    const detectorConfig = {
    runtime: "mediapipe",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
    maxHands: 2,
    modelType: "full",
    };
    detector = await window.handPoseDetection.createDetector(model, detectorConfig); //create hand detector
    console.log("Hand tracking set up successfully!");
    return true;
  } catch (error){
    console.error("Error setting up hand tracking:", error);
    alert(
      "Could not access webcam. Please allow webcam access and refresh the page.",
    );
    return false;
  }
}

function startDetection(){ //start hand detection loop
  if (!detector || !video) {
    console.error("Hand tracking not set up.");
    return;
  }
  isDetecting = true;
  detectHands();
}

function stopDetection(){ //stop hand detection loop
  isDetecting = false;
}

async function detectHands(){ //main hand detection loop, runs every ~30ms for ~30fps, async to avoid blocking UI
  if (!isDetecting) return; //one line if statement doesn't need brackets
  try { //estimate hand positions from video frame
    const hands = await detector.estimateHands(video);
    const handPositions = hands.map(hand => {
        const palmBase = [0, 5, 9, 13, 17].map((i) => hand.keypoints[i]); //use keypoints 0, 5, 9, 13, 17 to calculate average hand position (palm base)
        const avgX = palmBase.reduce((sum, kp) => sum + kp.x, 0) / palmBase.length;
        const avgY = palmBase.reduce((sum, kp) => sum + kp.y, 0) / palmBase.length;
        return { x: 640 -avgX, y: avgY };
    });
    if (sendHandsCallback){
        sendHandsCallback(handPositions); //send hand positions to main.js for use in game logic
    }
  } catch (error){
    console.error("Error detecting hands:", error);
  }
  setTimeout(() => detectHands(), 30);
}

window.handTracking = { //expose functions to global scope for use in main.js
  setupHandTracking,
  startDetection,
  stopDetection,
};