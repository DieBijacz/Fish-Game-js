// Canvas Setup

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '50px Georgia';
let gameSpeed = 1;
let gameOver = false;

// Mouse Interactivity

let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    click: false
}
canvas.addEventListener('mousedown', function (event) {
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;   /* gets x and y pos and apply offset from getBoundingClientRect()*/
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function () {
    mouse.click = false;
})

// Player
const playerLeft = new Image();
playerLeft.src = '../assets/graphics/spritesheets/__cartoon_fish_06_red_swim.png'
const playerRight = new Image();
playerRight.src = '../assets/graphics/spritesheets/red_swim_right.png'
class Player {
    constructor() {
        this.x = canvas.width;      /* początkowa pozycja playera */
        this.y = canvas.height / 2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update() {            /* update player pos to mouse pos */
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        let theta = Math.atan2(dy, dx);
        this.angle = theta;
        if (mouse.x != this.x) {
            this.x -= dx / 20;
        }
        if (mouse.y != this.y) {
            this.y -= dy / 20;
        }
        if (gameFrame % 5 == 0) {
            this.frame++;
            if (this.frame >= 12) this.frame = 0; //cycles though sprite imgs cut offs
            if (this.frame == 3 || this.frame == 7 || this.frame == 11) {    // @ | @ | @ | @ (3)
                this.frameX = 0;                                             // @ | @ | @ | @ (7)
            } else {                                                         // @ | @ | @ | @ (11)
                this.frameX++;
            }
            if (this.frame < 3) this.frameY = 0;
            else if (this.frame < 7) this.frameY = 1;
            else if (this.frame < 11) this.frameY = 2;
            else this.frameY = 0;
        }

    }
    draw() {
        if (mouse.click) {   /* rysuje linie od pozycji playera do myszki podczas mouse.click = True */
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke();
        }                  /* rysuje player */
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillRect(this.x, this.y, this.radius, 10);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.x >= mouse.x) {
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth / 4, this.spriteHeight / 4);
        } else {
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth / 4, this.spriteHeight / 4);
        }
        ctx.restore();
    }
}
const player = new Player();

// Bubbles
const bubbleArray = [];
const bubbleImage = new Image();
bubbleImage.src = 'assets/Bubbles/bubble_pop_one/bubble_pop_frame_01.png';
class Bubble {
    constructor() {
        this.x = Math.random() * canvas.width;  /* x, y where bubbles are spawned */
        this.y = canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }
    update() {
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx * dx + dy * dy) /* pitagoras. calculate distance between bubble and player */
    }
    draw() {
        // ctx.fillStyle = 'blue';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.stroke();
        ctx.drawImage(bubbleImage, this.x - 65, this.y - 65, this.radius * 2.6, this.radius * 2.6);
        //                         this.x and this.y from Bubble class
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = '../assets/bubbles-single1.wav';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = '../assets/bubbles-single2.wav';

function handleBubbles() {
    if (gameFrame % 50 == 0) {
        bubbleArray.push(new Bubble());
    }
    for (let i = 0; i < bubbleArray.length; i++) {
        bubbleArray[i].update();
        bubbleArray[i].draw();
        if (bubbleArray[i].y < 0 - bubbleArray[i].radius * 2) {  /* removes bubbles when they reach top + size of bubble */
            bubbleArray.splice(i, 1);
            i--;
        } else if (bubbleArray[i].distance < bubbleArray[i].radius + player.radius) {
            /* ===== collision bubble and player ====== */
            if (!bubbleArray[i].counted) {
                if (bubbleArray[i].sound == 'sound1') {
                    // bubblePop1.play();
                } else {
                    // bubblePop2.play();
                }
                score++;
                bubbleArray[i].counted = true;
                bubbleArray.splice(i, 1);
                i--;
            }
        }
    }
}

// Enemies
const enemyImage = new Image();
enemyImage.src = "assets/Fishgameasset/spritesheets/__green_cartoon_fish_01_swim.png"

class Enemy {
    constructor() {
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150) + 90
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0; // will cycle between 0 1 2 3 as there are 4 img in col
        this.frameY = 0; // will cycle between 0 1 2 as there are 3 img in row on sprite sheet
        this.spriteWidth = 418; //devides sprite to get single img
        this.spriteHeight = 397;
    }
    //draw circle to use in collisions
    draw() {
        // ctx.fillStyle = 'red';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill(); // what↓↓        cut from sprite on x ↓↓    |     cut from sprite on y ↓↓  |    size of cut x ↓↓ | size of cut y ↓↓ |    pos of img ↓↓      |    width and height of img ↓↓
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 60, this.y - 70, this.spriteWidth / 3, this.spriteHeight / 3)
    }
    update() {
        this.x -= this.speed; // moves enemy to left on each frame based on this.speed
        if (this.x < 0 - this.radius * 2) { // if enemy is out of window:
            this.x = canvas.width + 200;    //reset his pos with new random this.y and this.speed
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random() * 2 + 2;
        }


        // enemy img animation on every 5th frame
        if (gameFrame % 5 == 0) {
            this.frame++;
            if (this.frame >= 12) this.frame = 0; //cycles though sprite imgs cut offs
            if (this.frame == 3 || this.frame == 7 || this.frame == 11) {    // @ | @ | @ | @ (3)
                this.frameX = 0;                                             // @ | @ | @ | @ (7)
            } else {                                                         // @ | @ | @ | @ (11)
                this.frameX++;
            }
            if (this.frame < 3) this.frameY = 0;
            else if (this.frame < 7) this.frameY = 1;
            else if (this.frame < 11) this.frameY = 2;
            else this.frameY = 0;
        }

        // enemy collision
        const dx = this.x - player.x; // distance on x axis from enemy to player
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy) // pitagoras
        if (distance < this.radius + player.radius) {
            handleGameOver();
        }
    }
}
const enemy1 = new Enemy(); // creates actual enemy based on Enemy class
function handleEnemies() {
    enemy1.draw();
    enemy1.update();
}

function handleGameOver() {
    ctx.fillStyle = 'white';
    ctx.fillText('Game Over. score: ' + score, 130, 250);  // (text + pos of text)
    gameOver = true;
}

// Repeating backgrounds 
const background = new Image();
background.src = "assets/graphics/background1.png"; //import bg img

const BG = {
    x1: 0, // 1st bg img
    x2: canvas.width, //2nd bg img
    y: 0,
    width: canvas.width,  // to cover whole area
    height: canvas.height
}
// BACKGROUND LOOPS 2 IMG =======
function handleBackground() {
    BG.x1 -= gameSpeed;
    if (BG.x1 < -BG.width) BG.x1 = BG.width; // loops 1st img
    BG.x2 -= gameSpeed;
    if (BG.x2 < -BG.width) BG.x2 = BG.width; // loops 2st img
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height)
    //draw imported img on x, y === BG and width, height of canvas
    //this is just top of bg. underwater is in cavas1 done with linear-gradient
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height)
}


// Animation Loop

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackground()
    handleBubbles();
    player.update();
    player.draw();
    handleEnemies()
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 10, 50)
    gameFrame++;
    if (!gameOver) requestAnimationFrame(animate); // if not game over keep animate

}
animate();

window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
});