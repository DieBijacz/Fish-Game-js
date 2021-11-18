// Canvas Setup

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0;
ctx.font = '50px Georgia';
let gameSpeed = 1;

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
for (let i = 0; i < bubbleArray.length; i++) {

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
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 10, 50)
    gameFrame++;
    requestAnimationFrame(animate);

}
animate();

window.addEventListener('resize', function () {
    canvasPosition = canvas.getBoundingClientRect();
});