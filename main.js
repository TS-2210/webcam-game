const config = {
  ballCount: 1,
  ballRadius: 20,
  gravity: 0.2,
  bounceVelocity: -8,
  handRadius: 50,
  countdownTime: 3,
};

let gameState = {
  balls: [],
  hands: [],
  score: 0,
  gameOver: false,
  startTime: null,
  animationId: null,
  countdown: 0,
  isCountingDown: false,
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const overlayMessage = document.getElementById("overlayMessage");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingStatus = document.getElementById("loadingStatus");

function initBalls() {
  gameState.balls = [];
  for (let i = 0; i < config.ballCount; i++) {
    gameState.balls.push({
      x: canvas.width / 2,
      y: 100,
      vx: 0,
      vy: 0,
      radius: config.ballRadius,
      color: `hsl(${i * 120}, 70%, 60%)`,
    });
  }
}

function updateBalls() {
  gameState.balls.forEach((ball) => {
    ball.vy += config.gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.vx *= -1;
      ball.x =
        ball.x < canvas.width / 2 ? ball.radius : canvas.width - ball.radius;
    }

    if (ball.y - ball.radius < 0) {
      ball.vy *= -1;
      ball.y = ball.radius;
    }
  });
}

function checkCollisions() {
  gameState.balls.forEach((ball) => {
    gameState.hands.forEach((hand) => {
      const dx = ball.x - hand.x;
      const dy = ball.y - hand.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < ball.radius + config.handRadius) {
        ball.vy = config.bounceVelocity;
        ball.vx += dx * 0.1;
        const angle = Math.atan2(dy, dx);
        const targetX =
          hand.x + Math.cos(angle) * (ball.radius + config.handRadius);
        const targetY =
          hand.y + Math.sin(angle) * (ball.radius + config.handRadius);
        ball.x = targetX;
        ball.y = targetY;
      }
    });
  });
}