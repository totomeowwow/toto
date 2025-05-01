document.getElementById("cat");
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

// Create a music element and load the song
const music = new Audio('music.mp3'); // Replace with your music file path
music.loop = true; // Loop the music indefinitely

// Sound effects for eating and dying
const eatSound = new Audio('nom.mp3'); // Replace with your eating sound file path
const dieSound = new Audio('oof.mp3'); // Replace with your dying sound file path

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

// Array of random messages
const messages = [
  "Mmm, fish is yummy!",
  "Catch me if you can!",
  "Nom nom nom!",
  "Is that a bomb?!",
  "Tuna's my favorite!",
  "I'm purrfect at this!",
  "Gotcha!",
  "I love catching treats!",
  "I’m the purrfect catcher!",
  "Mmm, sushi time!",
  "I’m too fast for these bombs!",
  "I’m a treat magnet!",
  "Catching fish is pawsome!",
  "Toto, you should kiss Dodo right now!",
  "My whiskers are sensing Toto's gonna flash Dodo.",
  "Look, a snack! I'm talking about u by the way.",
  "Ente dlo3t Dodo!",
  "¡Miau, miau, nom nom!",
  "I'm a snack attack!",
  "Sushi, here I come!",
  "I’m the fastest cat in the world!",
  "By the way, Dodo loves you toto!",
  "I'm pregnant!",
  "Me love treat!"
];

// Shuffle utility
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Initialize shuffled messages
let shuffledMessages = shuffleArray([...messages]);
let messageIndex = 0;

function getNextMessage() {
  const message = shuffledMessages[messageIndex++];
  if (messageIndex >= shuffledMessages.length) {
    shuffledMessages = shuffleArray([...messages]);
    messageIndex = 0;
  }
  return message;
}

// Create a speech bubble element
const speechBubble = document.createElement("div");
speechBubble.classList.add("speech-bubble");
game.appendChild(speechBubble);

// Variable to track cooldown
let canShowMessage = true;

window.addEventListener("keydown", e => {
  if (gameOver || paused) return;

  if ((e.key === "ArrowLeft" || e.key === "a") && catPos > 0) catPos--;
  if ((e.key === "ArrowRight" || e.key === "d") && catPos < 2) catPos++;
  if (e.key === "r") location.reload();
  if (e.key === "m") toggleMusic(); // Toggle music when "M" is pressed

  cat.className = `lane-${catPos}`;
});

function toggleMusic() {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
}

function spawnTreatSpecial(timestamp) {
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

    speed = 2 + score * 0.05;
    spawnRate = Math.max(500, 1500 - score * 15);
    bombChance = Math.min(0.9, 0.1 + score * 0.005);
  }
}

function loopSpecial(timestamp) {
  if (gameOver) return;
  if (!paused) {
    spawnTreatSpecial(timestamp);
    treats.forEach((t, i) => {
      t.y += speed;
      t.el.style.top = `${t.y}px`;
      const rectT = t.el.getBoundingClientRect();
      const rectC = cat.getBoundingClientRect();
      if (rectT.bottom >= rectC.top && rectT.left < rectC.right && rectT.right > rectC.left) {
        clearTreat(i);
        if (t.type === "bad") return endGame(); // ends game if a bomb is caught
        score++;
        scoreDisplay.textContent = `Score: ${score}`;

        // Play sound when cat eats something good
        eatSound.play();

        // Show speech bubble with shuffled message
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
  requestAnimationFrame(loopSpecial);
}
requestAnimationFrame(loopSpecial);

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

  // Play the die sound and stop the music
  dieSound.play();
  music.pause(); // Pause music when game ends

  overlay.onclick = () => {
    location.reload(); // Reload the page to start a new game
  };
}

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
instructions.style.color = "#333"; // Darker gray color
game.appendChild(instructions);

