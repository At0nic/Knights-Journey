const canvas = document.getElementById('playingField');
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth
canvas.height = window.innerHeight
const keysPressed = [];
const keyUp = "ArrowUp";
const keyDown = "ArrowDown";
const image = document.getElementById('player1');

//Zaznamenání stisknutí ovládání
window.addEventListener('keydown', function(e){
    keysPressed[e.key] = true;
});
window.addEventListener('keyup', function(e){
    keysPressed[e.key] = false;
});

function vec2(x, y){
    return{x: x, y: y};
}
//míČ
function Ball(position, velocity, radius){
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;

    this.update = function(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    };

    this.draw = function(){
        ctx.beginPath();
        ctx.fillStyle = "#ff0000";
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fill();
        ctx.stroke();
    };
}
//Hráče/bot
function Player(position, velocity, width, height){
    this.position = position;
    this.velocity = velocity;
    this.width = width;
    this.height = height;
    this.score = 0;
    

    this.update = function() {
        if(keysPressed[keyUp]){
            this.position.y -= this.velocity.y;
        }
        if(keysPressed[keyDown]){
            this.position.y += this.velocity.y;
        }
    };
    this.draw = function () {
        ctx.drawImage(image, this.position.x, this.position.y, this.width, this.height);
    };
    this.getHalfWidth = function(){
        return this.width / 2;
    }
    this.getHalfHeight = function(){
        return this.height / 2;
    }
    this.getCenter = function (){
        return vec2(
            this.position.x + this.getHalfWidth(),
            this.position.y  + this.getHalfHeight(),
        );
    }
}
//Kolize hráče/bota s okrajema
function playerCollisionWithEdge(){
    if(player.position.y <= 0){
            player.position.y = 0;
    }

    if(player.position.y + player.height >= canvas.height){
        player.position.y = canvas.height - player.height;
}
}
//Kolize míČe s okrajema
function ballCollisionWithEdges(){
    if (ball.position.y + ball.radius >= canvas.height){
        ball.velocity.y *= -1
    }
    if (ball.position.y - ball.radius <= 0){
        ball.velocity.y *= -1
    }
}
//Kolize hráče/bota s míčem
function playerCollisionWithBall(ball, player){
    let dx = Math.abs(ball.position.x - player.getCenter().x);
    let dy = Math.abs(ball.position.y - player.getCenter().y);

    if(dx <= (ball.radius + player.getHalfWidth()) && dy <= (ball.radius + player.getHalfHeight())){
        ball.velocity.x *= -1
    }
}
//Ai druhého hráče
function Ai(ball, player){
    if(ball.velocity.x > 0){
        if(ball.position.y > player.position.y){
            player.position.y += player.velocity.y;

            if(player.position.y + player.height >= canvas.height){
                player.position.y = canvas.height - player.height;
            }
        }
        if(ball.position.y < player.position.y){
            player.position.y -= player.velocity.y;

            if(player.position.y <= 0){
                player.position.y = 0;
            }
        }
    }
}
//Spawnování míče
function respawnBall(ball){
    if (ball.velocity.x > 0){
        ball.position.x = canvas.width - 150;
        ball.position.y = (Math.random() * (canvas.height - 200)) + 100;
    }

    if(ball.velocity.x < 0){
        ball.position.x = 150;
        ball.position.y = (Math.random() * (canvas.height - 200)) + 100;
    }

    ball.velocity.x *= -1;
    ball.velocity.y *= -1;
}
//Počítání a zaznamenávání skóre
function increaseScore(ball, player, bot){
    if(ball.position.x <= -ball.radius){
        bot.score += 1;
        document.getElementById("player2Score").innerHTML = bot.score;
        respawnBall(ball);
    }
    if(ball.position.x >= canvas.width + ball.radius){
        player.score += 1;
        document.getElementById("player1Score").innerHTML = player.score;
        respawnBall(ball);
    }
}

//Vytvoření entit
const ball = new Ball(vec2(200, 200,), vec2(13, 13), 20);
const player = new Player(vec2(0, 50), vec2(15, 15), 100, 100);
const bot = new Player(vec2(canvas.width - 100, 30), vec2(11, 11), 100, 100);

//Aktivní dění ve hře
function gameUpdate(){
    ball.update();
    player.update();
    playerCollisionWithEdge(player)
    ballCollisionWithEdges(ball);
    Ai(ball, bot);
    playerCollisionWithBall(ball, player)
    playerCollisionWithBall(ball, bot)

    increaseScore(ball, player, bot)
}

//"Kreslení" vśech objektů
function gameDraw(){
    ball.draw();
    player.draw();
    bot.draw();
}

//Cycklus aby hra furt běžela
function gameLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(gameLoop);

    gameUpdate();
    gameDraw();
}