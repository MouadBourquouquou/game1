class Player {
    constructor(game){
        this.game = game;
        this.width = 50;
        this.height = 50;
        this.x = game.width /2 - this.width/2;
        this.y = game.height-this.height;
        this.dir = true;
        this.speed = 5;
        this.tire = false;
        this.image = document.getElementById("me");
    }
    draw(context){
        context.fillStyle = "white";
        // context.fillRect(this.x,this.y,this.width,this.height);
        context.drawImage(this.image,this.x,this.y);
    }

    shoot(){
        const currentFire = this.game.useFire();
        if(currentFire) currentFire.start(this.x + this.width/2 -currentFire.width/2,this.y);
    }
    restart(){
        this.x = this.game.width /2 - this.width/2;
        this.y = this.game.height-this.height;
        this.tire = false;
        this.dir = true;
    }
}


class Monster {
    constructor(game,positionX,positionY){
        this.game = game;
        this.width = this.game.mostSize;
        this.height = this.game.mostSize;
        this.x = 0;
        this.y = 0;

        this.positionX = positionX;
        this.positionY = positionY;

        this.colison = false;

        this.image = document.getElementById("spider");
    }
    draw(ctx){
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        // ctx.strokeRect(this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image,this.x,this.y);
    }
    update(x,y){
        this.x = x + this.positionX;
        this.y = y + this.positionY;
        this.game.boolFire.forEach(fire=>{
            if (!fire.free && this.game.checkColl(this,fire)){
                this.colison = true;
                fire.reset();
                this.game.score ++;
                this.game.NbColision ++;
            } 
            if(this.game.checkColl(this,this.game.Player) || this.y >= this.game.height - this.height){
                this.game.gameOver = true;
            }
        })
    }
}

class Wave {
    constructor(game) {
        this.game = game;
        this.width = this.game.col * this.game.mostSize;
        this.height = this.game.row * this.game.mostSize;
        this.x = 0;
        this.y = -this.height;
        this.speedX = 3;
        this.speedY = this.game.mostSize;
        this.Monster = [];
        this.createMon();
    }

    addWave(){
        if(this.game.NbColision == this.game.col * this.game.row){
            let rand = Math.random(0,1);
            if(rand<0.5) this.game.col ++;
            else this.game.row ++;
            this.game.waves.push(new Wave(this.game));
            this.game.stage ++;
            this.game.NbColision = 0;
            this.speedX *= 0.9;
        }
    }

    render(ctx){
        this.x += this.speedX;
        if(this.y < 0) this.y += this.height +50;

        if(this.x>this.game.width - this.width  || this.x < 0 ){
            this.speedX *= -1; 
            if(this.y - this.height < this.game.height - this.height)
            this.y += this.speedY;
        } 
        this.Monster.forEach((monst)=>{
            if(monst.colison == false){
                monst.update(this.x,this.y);
                monst.draw(ctx);
            }

        })
    }

    createMon(){
        for(let i = 0 ; i<this.game.col;i++){
            for(let j = 0 ; j<this.game.row ;j++){
                let PosX = this.game.mostSize * i;
                let PosY = this.game.mostSize * j;
                this.Monster.push(new Monster(this.game,PosX,PosY));
            }
        }
    }
}


class Fire {
    constructor(){
        this.width = 5;
        this.height = 8;
        this.x = 20;
        this.y = 10;
        this.speed = 8;
        this.free = true;
    }
    draw(context){
        context.fillStyle = "red";
        if(!this.free) context.fillRect(this.x,this.y,this.width,this.height);
    }

    update(){
        if(!this.free) this.y -= this.speed;
        if(this.y <=5) this.reset();
    }

    start(x,y){
        this.x = x;
        this.y = y;

        this.free = false;
    }
    reset(){
        this.free = true;
    }
}

class Game {
    constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.Player = new Player(this);
        this.keys = [];
        
        this.boolFire = [];
        this.boolFireNum = 10;
        this.creatBool();
        this.col = 3;
        this.row = 3;
        this.mostSize = 30;
        this.waves = [];
        this.waves.push(new Wave(this));


        this.score = 0;
        this.stage = 1;
        this.NbColision = 0;
        this.gameOver = false;
        this.levelMback =  Math.floor(Math.random() * 9);


        document.addEventListener('keydown', (event) => {
            if(this.keys.indexOf(event.key) == -1) this.keys.push(event.key);
            this.Player.tire ++;
            // console.log(this.keys);
        });
        document.addEventListener('keyup', (event) => {
            let index = this.keys.indexOf(event.key);
            if(index != -1) this.keys.splice(index,1);
            this.Player.tire ++;
            // console.log(this.keys);
        });
    }

    creatBool(){
            for(let i = 0 ; i<this.boolFireNum ; i++) this.boolFire[i] = new Fire();
        }
    useFire(){
        for(let i = 0;i<this.boolFire.length;i++){
            if(this.boolFire[i].free) return this.boolFire[i];
        }
    }
    Go(context){
        this.Player.draw(context);
        for(let x of this.keys){
            if(this.Player.x>=5) 
                if(x==="ArrowLeft") this.Player.x -= this.Player.speed;
            if(x==='x') {
                if(this.Player.tire>=2){
                    this.Player.shoot();
                    // console.log("this is X");
                }
                this.Player.tire = 0;
            }
            if(this.Player.x <=this.width - this.Player.width -5) 
                if(x==="ArrowRight") this.Player.x += this.Player.speed;
            // if(this.Player.y>=5)
            //     if(x==="ArrowUp") this.Player.y -= this.Player.speed;
            // if(this.Player.y <= this.height - this.Player.height -5)
            //     if(x==="ArrowDown") this.Player.y += this.Player.speed;
            if(x==="r") this.restart();
        }
        this.addText(context);
        this.boolFire.forEach((fire)=>{
            fire.draw(context);
            fire.update();
        })
        this.waves.forEach((wave)=>{
            wave.render(context);
            wave.addWave();
        })

    }
    checkColl(a, b){
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    addText(ctx){
        ctx.font = "20px Tahoma";
        ctx.textAlign = "left";
        ctx.fillText(`Stage : ${this.stage}`,this.width - 100,40);
        ctx.fillText(`Score : ${this.score}`,10,40);
        ctx.font = "40px Tahoma";
        ctx.textAlign = "center";
        if(this.gameOver == true) {
            ctx.fillText(`GAME OVER !`,this.width/2,this.height/2);
            ctx.font = "20px Tahoma";
            ctx.fillText(`Press R to restart `,this.width/2,this.height/2 + 40);
        }
    }
    restart(){
        this.Player.restart();
        this.col = 3;
        this.row = 3;
        this.waves = [];
        this.waves.push(new Wave(this));
        this.score = 0;
        this.stage = 1;
        this.NbColision = 0;
        this.gameOver = false;
    }
}

window.addEventListener("load",()=>{
    let myBody = document.getElementsByTagName("body");
    let theGame = document.getElementById("mainGame");
    let ctx = theGame.getContext("2d");
    theGame.width = 300;
    theGame.height = 500;
    const myGame = new Game(theGame);
    let background = [`url("../images/dark2.webp")`,
        `url("../images/dark3.webp")`,
        `url("../images/dark4.webp")`,
        `url("../images/dark8.png")`,
        `url("../images/dark9.webp")`,
        `url("../images/dark10.jpeg")`,
    ];
    let shoot = document.getElementById("shoot");
    let toLeft = document.getElementById("toLeft");
    let toRight = document.getElementById("toRight");
    let restart = document.getElementById("restart");
    function animate(){
        if(myGame.stage > background.length){
            theGame.style.backgroundImage = background[myGame.levelMback];
            myBody[0].style.backgroundImage = background[myGame.levelMback]
        } 
        else{
            theGame.style.backgroundImage = background[myGame.stage-1];
            myBody[0].style.backgroundImage = background[myGame.stage-1]
        } 
        if(myGame.gameOver == false){
            ctx.clearRect(0,0,theGame.width,theGame.height);
            myGame.Go(ctx);
            if(!myGame.gameOver) requestAnimationFrame(animate);
            else myGame.addText(ctx);
        }
    }
     document.addEventListener("keydown",(event)=>{
        if(event.key =="r" && myGame.gameOver) {
            myGame.restart();
            animate();
        }
            });
    shoot.addEventListener("click",()=>{
        if(!myGame.gameOver) myGame.Player.shoot();
    })
    toLeft.addEventListener("click",()=>{
        if(myGame.Player.x <=myGame.width - myGame.Player.width -5) 
            if(!myGame.gameOver) myGame.Player.x += myGame.Player.speed;
    })
    toRight.addEventListener("click",()=>{
        if(myGame.Player.x>=5) 
            if(!myGame.gameOver) myGame.Player.x -= myGame.Player.speed;
    })
    restart.addEventListener("click",()=>{
        if(myGame.gameOver){
            myGame.restart();
            animate();
        }
    })
    animate();
});