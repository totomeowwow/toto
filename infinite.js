// Game variables
const cat = document.getElementById("cat");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const overlay = document.getElementById("game-over-overlay");
const deathGif = document.getElementById("death-gif");
const restartText = document.getElementById("restart-text");
const pauseBtn = document.getElementById("pause-btn");
const pauseOverlay = document.getElementById("pause-overlay");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");

// Audio elements
const music = new Audio('music.mp3');
music.loop = true;
const eatSound = new Audio('nom.mp3');
const dieSound = new Audio('oof.mp3');

// Game state
let score = 0;
let catPos = 1;
let gameOver = false;
let paused = false;
let speed = 2;
let spawnRate = 1500;
let bombChance = 0.1;
const lanePercents = [15, 50, 85];
const treats = [];
let lastSpawn = 0;

// Messages
const messages = [
  "Mmm, fish is yummy!",
  "Catch me if you can!",
  "Nom nom nom!",
  "Is that a bomb?!",
  "Tuna's my favorite!",
  "I'm purrfect at this!",
  "Gotcha!",
  "I love catching treats!",
  "I'm the purrfect catcher!",
  "Mmm, sushi time!",
  "I'm too fast for these bombs!",
  "I'm a treat magnet!",
  "Catching fish is pawsome!",
  "Toto, you should kiss Dodo right now!",
  "My whiskers are sensing Toto's gonna flash Dodo.",
  "Look, a snack! I'm talking about u by the way.",
  "Ente dlo3t Dodo!",
  "¡Miau, miau, nom nom!",
  "I'm a snack attack!",
  "Sushi, here I come!",
  "I'm the fastest cat in the world!",
  "By the way, Dodo loves you toto!",
  "I'm pregnant!",
  "Me love treat!"
];

// Shuffle messages
let shuffledMessages = shuffleArray([...messages]);
let messageIndex = 0;

// Speech bubble
const speechBubble = document.createElement("div");
speechBubble.classList.add("speech-bubble");
game.appendChild(speechBubble);
let canShowMessage = true;

// Mobile controls
const mobileControls = document.createElement("div");
mobileControls.id = "mobile-controls";
mobileControls.innerHTML = `
  <button id="mobile-left">←</button>
  <button id="mobile-right">→</button>
`;
document.body.appendChild(mobileControls);

const mobileLeft = document.getElementById("mobile-left");
const mobileRight = document.getElementById("mobile-right");
const mobileMusicBtn = document.createElement("button");
mobileMusicBtn.id = "mobile-music-btn";
mobileMusicBtn.textContent = music.paused ? "🔇" : "🔊";
document.body.appendChild(mobileMusicBtn);

// Position music button
mobileMusicBtn.style.position = "fixed";
mobileMusicBtn.style.bottom = "25px";
mobileMusicBtn.style.left = "25px";
mobileMusicBtn.style.width = "60px";
mobileMusicBtn.style.height = "60px";
mobileMusicBtn.style.borderRadius = "50%";
mobileMusicBtn.style.fontSize = "24px";
mobileMusicBtn.style.zIndex = "100";
mobileMusicBtn.style.display = "flex";
mobileMusicBtn.style.alignItems = "center";
mobileMusicBtn.style.justifyContent = "center";
mobileMusicBtn.style.backgroundColor = "#ff7f7f";
mobileMusicBtn.style.color = "white";
mobileMusicBtn.style.border = "none";

// Touch controls
let touchStartX = 0;
let touchEndX = 0;

// Functions
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function getNextMessage() {
  const message = shuffledMessages[messageIndex++];
  if (messageIndex >= shuffledMessages.length) {
    shuffledMessages = shuffleArray([...messages]);
    messageIndex = 0;
  }
  return message;
}

function toggleMusic() {
  if (music.paused) {
    music.play();
    mobileMusicBtn.textContent = "🔊";
  } else {
    music.pause();
    mobileMusicBtn.textContent = "🔇";
  }
}

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  if (gameOver || paused) return;
  
  touchEndX = e.changedTouches[0].screenX;
  const diffX = touchStartX - touchEndX;
  
  if (diffX > 50 && catPos < 2) {
    catPos++;
  } else if (diffX < -50 && catPos > 0) {
    catPos--;
  }
  
  cat.className = `lane-${catPos}`;
}

function spawnTreat(timestamp) {
  if (timestamp - lastSpawn > spawnRate) {
    lastSpawn = timestamp;
    const item = Math.random() < bombChance
      ? { emoji: "💣", type: "bad" }
      : { emoji: ["🐟", "🍣", "🍰"][Math.floor(Math.random() * 3)], type: "good" };

    const lane = lanePercents[Math.floor(Math.random() * 3)];
    const el = document.createElement("div");
    el.className = "falling";
    el.textContent = item.emoji;
    el.dataset.type = item.type;
    el.style.left = `${lane}%`;
    game.appendChild(el);
    treats.push({ el, y: 0, type: item.type });

    // ENDLESS MODE DIFFICULTY
    speed = 2 + Math.floor(score / 10) * 0.5;
    spawnRate = Math.max(300, 1500 - score * 10);
    bombChance = Math.min(0.5, 0.1 + score * 0.002);
  }
}

function loop(timestamp) {
  if (gameOver) return;
  if (!paused) {
    spawnTreat(timestamp);
    treats.forEach((t, i) => {
      t.y += speed;
      t.el.style.top = `${t.y}px`;
      const rectT = t.el.getBoundingClientRect();
      const rectC = cat.getBoundingClientRect();
      if (rectT.bottom >= rectC.top && rectT.left < rectC.right && rectT.right > rectC.left) {
        clearTreat(i);
        if (t.type === "bad") return endGame();
        score++;
        scoreDisplay.textContent = `Score: ${score}`;

        eatSound.play();

        if (canShowMessage) {
          canShowMessage = false;
          const message = getNextMessage();
          speechBubble.textContent = message;
          speechBubble.style.display = "block";
          const catRect = cat.getBoundingClientRect();
          speechBubble.style.left = `${catRect.left + catRect.width / 2 - speechBubble.offsetWidth / 2}px`;
          speechBubble.style.top = `${catRect.top - 170}px`;

          setTimeout(() => {
            speechBubble.style.opacity = "0";
          }, 0);

          setTimeout(() => {
            speechBubble.style.display = "none";
            speechBubble.style.opacity = "1";
            canShowMessage = true;
          }, 3000);
        }
      } else if (t.y > game.clientHeight) {
        clearTreat(i);
      }
    });
  }
  requestAnimationFrame(loop);
}

function clearTreat(index) {
  treats[index].el.remove();
  treats.splice(index, 1);
}

function endGame() {
  gameOver = true;
  cat.textContent = '';
  cat.style.backgroundImage = "url('kosabye.gif')";
  cat.style.backgroundSize = "cover";
  cat.style.borderRadius = "20px";
  overlay.style.display = 'flex';
  deathGif.style.display = 'none';
  restartText.style.display = 'block';

  dieSound.play();
  music.pause();

  overlay.onclick = () => {
    location.reload();
  };
}

// Event listeners
window.addEventListener("keydown", e => {
  if (gameOver || paused) return;

  if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && catPos > 0) catPos--;
  if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && catPos < 2) catPos++;
  if (e.key === "r" || e.key === "R") location.reload();
  if (e.key === "m" || e.key === "M") toggleMusic();

  cat.className = `lane-${catPos}`;
});

mobileLeft.addEventListener("click", () => {
  if (catPos > 0) catPos--;
  cat.className = `lane-${catPos}`;
});

mobileRight.addEventListener("click", () => {
  if (catPos < 2) catPos++;
  cat.className = `lane-${catPos}`;
});

mobileMusicBtn.addEventListener("click", toggleMusic);
game.addEventListener("touchstart", handleTouchStart, false);
game.addEventListener("touchend", handleTouchEnd, false);

pauseBtn.onclick = () => { paused = true; pauseOverlay.style.display = 'flex'; };
resumeBtn.onclick = () => { paused = false; pauseOverlay.style.display = 'none'; };
restartBtn.onclick = () => location.reload();
menuBtn.onclick = () => window.location.href = 'index.html';

// Add instruction for "M" and "R" to top left corner
const instructions = document.createElement("div");
instructions.textContent = "Press 'M' to toggle music, 'R' to reset the game.";
instructions.style.position = "absolute";
instructions.style.top = "10px";
instructions.style.left = "10px";
instructions.style.fontSize = "16px";
instructions.style.color = "#333";
game.appendChild(instructions);

// Start game
requestAnimationFrame(loop);