
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =====================================
// GALAXY BACKGROUND
// =====================================

const stars = [];

for (let i = 0; i < 120; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: Math.random() * 1.2 + 0.3,
    brightness: Math.random() * Math.PI * 2
  });
}

function drawNebula(x, y, radius, color) {
  const cloud = ctx.createRadialGradient(
    x, y, 0, x, y, radius
  );

  cloud.addColorStop(0, color + "55");
  cloud.addColorStop(0.5, color + "20");
  cloud.addColorStop(1, color + "00");

  ctx.fillStyle = cloud;
  ctx.fillRect(
    x - radius, y - radius,
    radius * 2, radius * 2
  );
}

function drawPlanet(x, y, radius, color) {
  ctx.save();

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(10, 5, 35, 0.45)";

  ctx.beginPath();
  ctx.arc(
    x + radius * 0.35,
    y,
    radius * 0.8,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

function updateStars() {
  for (let star of stars) {
    star.y += star.speed;

    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
}

function drawGalaxy() {
  const gradient = ctx.createLinearGradient(
    0, 0, 0, canvas.height
  );

  gradient.addColorStop(0, "#120625");
  gradient.addColorStop(0.5, "#24104a");
  gradient.addColorStop(1, "#080c26");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawNebula(230, 180, 230, "#8b35ff");
  drawNebula(780, 470, 270, "#ff3c9e");
  drawNebula(510, 650, 190, "#166dff");

  drawPlanet(120, 530, 45, "#ff7744");
  drawPlanet(910, 160, 30, "#55aaff");

  for (let star of stars) {
    star.brightness += 0.025;

    const opacity =
      0.5 + Math.sin(star.brightness) * 0.5;

    ctx.fillStyle =
      `rgba(255,255,255,${opacity})`;

    ctx.fillRect(
      star.x,
      star.y,
      star.size,
      star.size
    );
  }
}

// =====================================
// PLAYER SETTINGS
// =====================================

let shipX = canvas.width / 2;
const shipY = canvas.height - 150;
const shipSpeed = 7;

let moveLeft = false;
let moveRight = false;

let lives = 3;
let invincibleUntil = 0;

// =====================================
// ALIEN SETTINGS
// =====================================

const rows = 5;
const columns = 5;

let enemyX = 280;
let enemyY = 60;
let enemySpeed = 1.5;

const enemyDrop = 20;
const enemySpacingX = 100;
const enemySpacingY = 65;

let enemies = [];

// =====================================
// LASER SETTINGS
// =====================================

let lasers = [];
let alienLasers = [];

const laserSpeed = 10;
const alienLaserSpeed = 4;

let lastShot = 0;
const shotCooldown = 250;

let lastAlienShot = 0;
const alienShotCooldown = 900;

// =====================================
// BOSS SETTINGS
// =====================================

let bossActive = false;
let bossX = canvas.width / 2;
let bossY = 150;
let bossSpeed = 2.5;

const bossMaxHealth = 30;
let bossHealth = bossMaxHealth;

let lastBossShot = 0;
const bossShotCooldown = 1100;

// =====================================
// GAME SETTINGS
// =====================================

let score = 0;
let gameOver = false;
let gameWon = false;

let bossMessageUntil = 0;

// =====================================
// CREATE ALIENS
// =====================================

function createEnemies() {
  enemies = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      enemies.push({
        col: col,
        row: row,
        alive: true
      });
    }
  }
}

// =====================================
// DRAW SPACESHIP
// =====================================

function drawSpaceship() {
  if (
    Date.now() < invincibleUntil &&
    Math.floor(Date.now() / 100) % 2 === 0
  ) {
    return;
  }

  ctx.save();
  ctx.translate(shipX, shipY);
  ctx.imageSmoothingEnabled = false;

  const flameLength = 20 + Math.random() * 15;

  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 20;

  ctx.fillStyle = "#0088ff";
  ctx.fillRect(-24, 30, 12, flameLength);
  ctx.fillRect(12, 30, 12, flameLength);

  ctx.fillStyle = "#aaffff";
  ctx.fillRect(-21, 30, 6, flameLength - 8);
  ctx.fillRect(15, 30, 6, flameLength - 8);

  ctx.shadowBlur = 0;

  // Outer wings
  ctx.fillStyle = "#b84b12";
  ctx.fillRect(-46, 2, 20, 24);
  ctx.fillRect(26, 2, 20, 24);

  // Main wings
  ctx.fillStyle = "#ff9c18";

  ctx.beginPath();
  ctx.moveTo(-12, -25);
  ctx.lineTo(-48, 22);
  ctx.lineTo(-48, 34);
  ctx.lineTo(-12, 18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(12, -25);
  ctx.lineTo(48, 22);
  ctx.lineTo(48, 34);
  ctx.lineTo(12, 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffe15a";
  ctx.fillRect(-39, 13, 14, 5);
  ctx.fillRect(25, 13, 14, 5);

  // Main body
  ctx.fillStyle = "#ffb52e";

  ctx.beginPath();
  ctx.moveTo(0, -48);
  ctx.lineTo(-17, -12);
  ctx.lineTo(-17, 35);
  ctx.lineTo(17, 35);
  ctx.lineTo(17, -12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffe66d";
  ctx.fillRect(-5, -25, 10, 46);

  // Cockpit
  ctx.fillStyle = "#263b63";
  ctx.fillRect(-10, -17, 20, 27);

  ctx.fillStyle = "#42d9ff";
  ctx.fillRect(-6, -13, 12, 18);

  ctx.fillStyle = "#c6ffff";
  ctx.fillRect(-4, -11, 4, 10);

  // Engines
  ctx.fillStyle = "#d66b18";
  ctx.fillRect(-30, 12, 12, 26);
  ctx.fillRect(18, 12, 12, 26);

  ctx.fillStyle = "#ffce48";
  ctx.fillRect(-27, 15, 6, 18);
  ctx.fillRect(21, 15, 6, 18);

  ctx.fillStyle = "#283044";
  ctx.fillRect(-29, 33, 10, 7);
  ctx.fillRect(19, 33, 10, 7);

  ctx.restore();
}

// =====================================
// DRAW COLORFUL ALIENS
// =====================================

function drawEnemy(x, y, type = 0) {
  ctx.save();
  ctx.translate(x, y);

  const colors = [
    "#77dd44",
    "#ff5599",
    "#ffcc33",
    "#44aaff"
  ];

  const color = colors[type % colors.length];

  ctx.shadowColor = color;
  ctx.shadowBlur = 12;

  ctx.fillStyle = "#403064";
  ctx.beginPath();
  ctx.ellipse(25, 17, 25, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(25, 15, 19, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "#a99acb";
  ctx.fillRect(0, 13, 6, 10);
  ctx.fillRect(44, 13, 6, 10);

  if (type % 4 === 1) {
    ctx.fillStyle = "white";
    ctx.fillRect(12, 11, 8, 8);
    ctx.fillRect(21, 5, 8, 8);
    ctx.fillRect(30, 11, 8, 8);

    ctx.fillStyle = "#202040";
    ctx.fillRect(15, 13, 3, 4);
    ctx.fillRect(24, 7, 3, 4);
    ctx.fillRect(33, 13, 3, 4);

  } else if (type % 4 === 2) {
    ctx.fillStyle = "white";
    ctx.fillRect(17, 5, 16, 9);
    ctx.fillRect(17, 17, 16, 9);

    ctx.fillStyle = "#202040";
    ctx.fillRect(23, 7, 5, 5);
    ctx.fillRect(23, 19, 5, 5);

  } else {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(25, 15, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#202040";
    ctx.beginPath();
    ctx.arc(25, 15, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.fillRect(22, 11, 3, 3);
  }

  ctx.fillStyle =
    type % 4 === 3 ? "#7788cc" : color;

  for (let i = 0; i < 4; i++) {
    ctx.fillRect(8 + i * 10, 32, 5, 10);
  }

  ctx.restore();
}

function getEnemyPosition(enemy) {
  return {
    x: enemyX + enemy.col * enemySpacingX,
    y: enemyY + enemy.row * enemySpacingY
  };
}

function drawEnemies() {
  for (let enemy of enemies) {
    if (enemy.alive) {
      const position = getEnemyPosition(enemy);

      drawEnemy(
        position.x,
        position.y,
        enemy.row % 4
      );
    }
  }
}

// =====================================
// DRAW GIANT ALIEN BOSS
// =====================================

function drawBoss() {
  ctx.save();
  ctx.translate(bossX, bossY);

  ctx.shadowColor = "#bb44ff";
  ctx.shadowBlur = 25;

  // Giant outer wings
  ctx.fillStyle = "#51227d";

  ctx.beginPath();
  ctx.moveTo(-65, -30);
  ctx.lineTo(-155, 10);
  ctx.lineTo(-125, 75);
  ctx.lineTo(-55, 55);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(65, -30);
  ctx.lineTo(155, 10);
  ctx.lineTo(125, 75);
  ctx.lineTo(55, 55);
  ctx.closePath();
  ctx.fill();

  // Armored body
  ctx.fillStyle = "#8632bc";
  ctx.beginPath();
  ctx.ellipse(0, 0, 90, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c16aff";
  ctx.beginPath();
  ctx.ellipse(0, -10, 65, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Horns
  ctx.fillStyle = "#f18cff";

  ctx.beginPath();
  ctx.moveTo(-55, -40);
  ctx.lineTo(-80, -95);
  ctx.lineTo(-20, -55);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(55, -40);
  ctx.lineTo(80, -95);
  ctx.lineTo(20, -55);
  ctx.closePath();
  ctx.fill();

  // Glowing red eyes
  ctx.shadowColor = "#ff2244";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ff3355";

  ctx.beginPath();
  ctx.ellipse(-30, -8, 18, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(30, -8, 18, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Dark pupils
  ctx.fillStyle = "#260b39";
  ctx.fillRect(-35, -14, 10, 12);
  ctx.fillRect(25, -14, 10, 12);

  // Mechanical mouth
  ctx.fillStyle = "#230e38";
  ctx.fillRect(-32, 25, 64, 15);

  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-26 + i * 12, 25, 6, 9);
  }

  // Tentacles
  const sway = Math.sin(Date.now() / 250) * 8;

  ctx.strokeStyle = "#b66aff";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";

  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 26, 48);
    ctx.quadraticCurveTo(
      i * 35 + sway,
      100,
      i * 42 - sway,
      120
    );
    ctx.stroke();
  }

  ctx.restore();
}

// =====================================
// BOSS HEALTH BAR
// =====================================

function drawBossHealth() {
  const barWidth = 400;
  const barHeight = 22;

  const x = (canvas.width - barWidth) / 2;
  const y = 55;

  ctx.save();

  ctx.textAlign = "center";
  ctx.font = "bold 23px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("ALIEN OVERLORD", canvas.width / 2, 38);

  ctx.fillStyle = "#291039";
  ctx.fillRect(x, y, barWidth, barHeight);

  ctx.fillStyle = "#ff3355";
  ctx.fillRect(
    x,
    y,
    barWidth * (bossHealth / bossMaxHealth),
    barHeight
  );

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, barHeight);

  ctx.restore();
}

// =====================================
// PLAYER SHOOTING
// =====================================

function shootLaser() {
  if (gameOver || gameWon) return;

  const now = Date.now();

  if (now - lastShot < shotCooldown) return;

  lastShot = now;

  lasers.push({
    x: shipX - 2.5,
    y: shipY - 55,
    width: 5,
    height: 20
  });
}

// =====================================
// ALIEN SHOOTING
// =====================================

function shootAlienLaser() {
  const living = enemies.filter(enemy => enemy.alive);

  if (living.length === 0) return;

  const randomEnemy =
    living[Math.floor(Math.random() * living.length)];

  const position = getEnemyPosition(randomEnemy);

  alienLasers.push({
    x: position.x + 22,
    y: position.y + 42,
    width: 6,
    height: 20,
    vx: 0,
    vy: alienLaserSpeed
  });
}

// =====================================
// BOSS SHOOTING
// =====================================

function shootBossLasers() {
  // Three lasers spread outward
  for (let direction = -1; direction <= 1; direction++) {
    alienLasers.push({
      x: bossX - 4,
      y: bossY + 115,
      width: 8,
      height: 25,
      vx: direction * 2.5,
      vy: 5.5
    });
  }
}

// =====================================
// UPDATE LASERS
// =====================================

function updateLasers() {
  for (let laser of lasers) {
    laser.y -= laserSpeed;
  }

  lasers = lasers.filter(
    laser => laser.y + laser.height > 0
  );
}

function updateAlienLasers() {
  for (let laser of alienLasers) {
    laser.x += laser.vx;
    laser.y += laser.vy;
  }

  alienLasers = alienLasers.filter(
    laser =>
      laser.y < canvas.height &&
      laser.x > -20 &&
      laser.x < canvas.width + 20
  );
}

// =====================================
// DRAW LASERS
// =====================================

function drawLasers() {
  ctx.save();

  ctx.fillStyle = "#00ff99";
  ctx.shadowColor = "#00ff99";
  ctx.shadowBlur = 20;

  for (let laser of lasers) {
    ctx.fillRect(
      laser.x,
      laser.y,
      laser.width,
      laser.height
    );
  }

  ctx.restore();
}

function drawAlienLasers() {
  ctx.save();

  ctx.fillStyle = "#ff3355";
  ctx.shadowColor = "#ff3355";
  ctx.shadowBlur = 20;

  for (let laser of alienLasers) {
    ctx.fillRect(
      laser.x,
      laser.y,
      laser.width,
      laser.height
    );
  }

  ctx.restore();
}

// =====================================
// START BOSS LEVEL
// =====================================

function startBossBattle() {
  bossActive = true;
  bossX = canvas.width / 2;
  bossY = 150;
  bossSpeed = 2.5;
  bossHealth = bossMaxHealth;

  lasers = [];
  alienLasers = [];

  lastBossShot = Date.now();
  bossMessageUntil = Date.now() + 2500;
}

// =====================================
// UPDATE BOSS
// =====================================

function updateBoss() {
  bossX += bossSpeed;

  if (bossX > canvas.width - 165) {
    bossX = canvas.width - 165;
    bossSpeed = -Math.abs(bossSpeed);
  }

  if (bossX < 165) {
    bossX = 165;
    bossSpeed = Math.abs(bossSpeed);
  }

  const now = Date.now();

  if (now - lastBossShot >= bossShotCooldown) {
    shootBossLasers();
    lastBossShot = now;
  }
}

// =====================================
// COLLISION DETECTION
// =====================================

function checkCollisions() {
  // Player lasers hit aliens or boss
  for (let laser of lasers) {
    if (laser.hit) continue;

    if (bossActive) {
      // Boss rectangular hitbox
      if (
        laser.x < bossX + 90 &&
        laser.x + laser.width > bossX - 90 &&
        laser.y < bossY + 65 &&
        laser.y + laser.height > bossY - 65
      ) {
        laser.hit = true;
        bossHealth--;
        score += 20;

        if (bossHealth <= 0) {
          bossHealth = 0;
          bossActive = false;
          gameWon = true;
          score += 500;
        }
      }

    } else {
      for (let enemy of enemies) {
        if (!enemy.alive) continue;

        const position = getEnemyPosition(enemy);

        if (
          laser.x < position.x + 60 &&
          laser.x + laser.width > position.x - 10 &&
          laser.y < position.y + 42 &&
          laser.y + laser.height > position.y
        ) {
          enemy.alive = false;
          laser.hit = true;
          score += 10;
          break;
        }
      }
    }
  }

  lasers = lasers.filter(laser => !laser.hit);

  // Alien and boss lasers hit spaceship
  if (Date.now() >= invincibleUntil) {
    for (let laser of alienLasers) {
      if (
        laser.x < shipX + 40 &&
        laser.x + laser.width > shipX - 40 &&
        laser.y < shipY + 35 &&
        laser.y + laser.height > shipY - 45
      ) {
        laser.hit = true;
        lives--;

        invincibleUntil = Date.now() + 1500;

        if (lives <= 0) {
          gameOver = true;
        }

        break;
      }
    }
  }

  alienLasers = alienLasers.filter(
    laser => !laser.hit
  );

  // All 25 aliens defeated: begin boss battle
  if (
    !bossActive &&
    !gameOver &&
    !gameWon &&
    enemies.every(enemy => !enemy.alive)
  ) {
    startBossBattle();
  }
}

// =====================================
// KEYBOARD CONTROLS
// =====================================

window.addEventListener("keydown", function(event) {
  if (
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.code === "Space"
  ) {
    event.preventDefault();
  }

  if (event.key === "ArrowLeft") {
    moveLeft = true;
  }

  if (event.key === "ArrowRight") {
    moveRight = true;
  }

  if (event.code === "Space" && !event.repeat) {
    shootLaser();
  }

  if (event.key.toLowerCase() === "r") {
    if (gameOver || gameWon) {
      restartGame();
    }
  }
});

window.addEventListener("keyup", function(event) {
  if (event.key === "ArrowLeft") {
    moveLeft = false;
  }

  if (event.key === "ArrowRight") {
    moveRight = false;
  }
});

window.addEventListener("blur", function() {
  moveLeft = false;
  moveRight = false;
});

// =====================================
// UPDATE SPACESHIP
// =====================================

function updateSpaceship() {
  if (moveLeft) shipX -= shipSpeed;
  if (moveRight) shipX += shipSpeed;

  shipX = Math.max(
    48,
    Math.min(canvas.width - 48, shipX)
  );
}

// =====================================
// UPDATE ALIENS
// =====================================

function updateEnemies() {
  enemyX += enemySpeed;

  const living = enemies.filter(
    enemy => enemy.alive
  );

  if (living.length === 0) return;

  let leftEdge = Infinity;
  let rightEdge = -Infinity;

  for (let enemy of living) {
    const position = getEnemyPosition(enemy);

    leftEdge = Math.min(leftEdge, position.x - 10);
    rightEdge = Math.max(rightEdge, position.x + 60);
  }

  if (
    (rightEdge >= canvas.width && enemySpeed > 0) ||
    (leftEdge <= 0 && enemySpeed < 0)
  ) {
    enemySpeed = -enemySpeed;
    enemyY += enemyDrop;
  }

  for (let enemy of living) {
    const position = getEnemyPosition(enemy);

    if (position.y + 42 >= shipY - 45) {
      gameOver = true;
      break;
    }
  }
}

// =====================================
// SCORE AND LIVES
// =====================================

function drawScore() {
  ctx.save();

  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";

  ctx.fillText("Score: " + score, 20, 35);

  ctx.fillStyle = "#ff5577";
  ctx.fillText(
    "Lives: " + "♥ ".repeat(lives),
    20, 70
  );

  ctx.restore();
}

// =====================================
// BOSS ANNOUNCEMENT
// =====================================

function drawBossMessage() {
  if (Date.now() >= bossMessageUntil) return;

  ctx.save();

  ctx.textAlign = "center";
  ctx.font = "bold 45px Arial";
  ctx.fillStyle = "#ff77ff";
  ctx.shadowColor = "#ff00ff";
  ctx.shadowBlur = 20;

  ctx.fillText(
    "BOSS INCOMING!",
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.restore();
}

// =====================================
// END SCREEN
// =====================================

function drawEndMessage() {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.font = "bold 55px Arial";

  if (gameWon) {
    ctx.fillStyle = "#00ff99";
    ctx.fillText(
      "GALAXY SAVED!",
      canvas.width / 2,
      canvas.height / 2
    );
  } else {
    ctx.fillStyle = "#ff4444";
    ctx.fillText(
      "GAME OVER",
      canvas.width / 2,
      canvas.height / 2
    );
  }

  ctx.fillStyle = "white";
  ctx.font = "25px Arial";

  ctx.fillText(
    "Final Score: " + score,
    canvas.width / 2,
    canvas.height / 2 + 50
  );

  ctx.fillText(
    "Press R to Restart",
    canvas.width / 2,
    canvas.height / 2 + 95
  );

  ctx.restore();
}

// =====================================
// RESTART GAME
// =====================================

function restartGame() {
  shipX = canvas.width / 2;

  enemyX = 280;
  enemyY = 60;
  enemySpeed = 1.5;

  lasers = [];
  alienLasers = [];

  score = 0;
  lives = 3;

  lastShot = 0;
  lastAlienShot = Date.now();
  lastBossShot = 0;
  invincibleUntil = 0;

  moveLeft = false;
  moveRight = false;

  bossActive = false;
  bossHealth = bossMaxHealth;
  bossX = canvas.width / 2;
  bossY = 150;
  bossMessageUntil = 0;

  gameOver = false;
  gameWon = false;

  createEnemies();
}

// =====================================
// MAIN GAME LOOP
// =====================================

function gameLoop() {
  updateStars();
  drawGalaxy();

  if (!gameOver && !gameWon) {
    updateSpaceship();
    updateLasers();
    updateAlienLasers();

    if (bossActive) {
      updateBoss();
    } else {
      updateEnemies();

      const now = Date.now();

      if (
        now - lastAlienShot >= alienShotCooldown
      ) {
        shootAlienLaser();
        lastAlienShot = now;
      }
    }

    checkCollisions();
  }

  // Draw game objects
  drawSpaceship();

  if (bossActive) {
    drawBoss();
    drawBossHealth();
  } else if (!gameWon) {
    drawEnemies();
  }

  drawLasers();
  drawAlienLasers();
  drawScore();

  if (bossActive) {
    drawBossMessage();
  }

  if (gameOver || gameWon) {
    drawEndMessage();
  }

  requestAnimationFrame(gameLoop);
}

// =====================================
// START GAME
// =====================================

createEnemies();
lastAlienShot = Date.now();
gameLoop();
