var canvas = document.getElementById('No_Hulls_Barr');
var context = canvas.getContext('2d');


//Major topics go in ALL CAPS
//Sub sections of topics have Starting Caps
//All things should have a labelled start comment and END comment
//No gap between title and start of functions
//Triple gap for separating MAJOR TOPICS

//GLOBALS
var WORLD_WIDTH = 2400;
var WORLD_HEIGHT = 1500;
var WORLD_WIDTH_HALF = WORLD_WIDTH / 2;
var WORLD_HEIGHT_HALF = WORLD_HEIGHT / 2;

var REEF_HEALTH = 4000; // roughtly 35%
var MAX_REEF_HEALTH = 4000;

var LEVEL = 1;
//END GLOBALS



//CAMERA
function camera() {
    this.x;
    this.y;
    this.topx;
    this.topy;
    this.bottomx;
    this.bottomy;
    this.width = canvas.width;
    this.height = canvas.height;
}

camera.prototype.update = function () {
    //Follow Player
    this.x = player1.x;
    this.y = player1.y;
    //Additional Coordinates
    this.topx = player1.x - (canvas.width / 2);
    //Don't cross world start (Y axis)
    if (this.topx < 0) this.topx = 0;
    //Don't cross world end (Y axis) WTF is this doing? Why "WORLD_WIDTH-canvas.width"?
    //WORLD_WIDTH-canvas.width measures if the world end hits the far right of the camera
    if (this.topx > WORLD_WIDTH - canvas.width) this.topx = WORLD_WIDTH - canvas.width;
    this.topy = player1.y - (canvas.height / 2);
    //Don't cross world end (X axis)
    if (this.topy < 0) this.topy = 0;
    if (this.topy > WORLD_HEIGHT - canvas.height) this.topy = WORLD_HEIGHT - canvas.height;
    this.bottomx = this.topx + this.width;
    this.bottomy = this.topy + this.height;
};

//Global Function for camera
//We should make this OOD, maybe?
function myX(x) {
    return x - worldCamera.topx;
}

function myY(y) {
    return y - worldCamera.topy;
}
//END CAMERA



//PROGRESS BARS
var pbar = new Image(150, 300);
pbar.src = "https://i.imgur.com/jvgWuJW.png";
var healthbar = new progressbar(65, 475, 170, 22, "purple"); // reef health
var batterybar = new progressbar(65, 512, 170, 21, "red"); // player healtrh now
function progressbar(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.src = pbar;

    this.update = function () { };

    this.draw = function (progress_number) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, progress_number, this.height);
    };
}
//END PROGRESS BAR



//CONTENT LOADER
//This has been made globally usable
function LoadContent(links, repository) {
    for (var i = 0; i < links.length; ++i) {
        var base_image = new Image();
        base_image.src = links[i];
        repository.push(base_image);
    }
}

//BACKGROUNDS
//Images
var background_links = [
"https://orig15.deviantart.net/80dc/f/2013/224/c/2/underwater_texture_2_by_dadrian-d6htj7x.jpg",
"https://pixabay.com/static/uploads/photo/2014/04/08/19/38/sky-319546_960_720.png",
"https://i.imgur.com/Obbetwq.png",
"https://i.imgur.com/sBhe1dO.png"
];
var WinImage = new Image();
WinImage.src = "https://dl.dropbox.com/s/yt87d6hfa6bmsqm/Winscreen.jpg";
var LoseImage = new Image();
LoseImage.src = "https://dl.dropbox.com/s/lkwkbg1xqv1ly25/LoseScreen.jpg";
var backgrounds = [];
//END Images

//Objects
var backgroundObs = [];
var bait_timer = 75;
var Q_timer = 75;
function backgroundOb(x, y, back) {
    this.x = x;
    this.y = y;
    this.image = back;
}

backgroundOb.prototype.draw = function () {
    if (this.draw == false) return;
    context.drawImage(backgrounds[this.image], this.x, this.y, canvas.width, canvas.height);
};

function backgroundEl(x, y, width, height, back) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = back;
}

backgroundEl.prototype.draw = function () {
    if (this.draw == false) return;
    context.drawImage(backgrounds[this.image], myX(this.x), myY(this.y), this.width, this.height);
};

var bg = new backgroundOb(0, (0 - (canvas.height / 2)), 1);
backgroundObs.push(bg);
var bg2 = new backgroundOb(0, (canvas.height / 2), 0);
backgroundObs.push(bg2);
var bg3 = new backgroundEl((WORLD_WIDTH / 2), (canvas.height / 2) - 110, 200, 200, 2);
backgroundObs.push(bg3);
var bg4 = new backgroundEl((WORLD_WIDTH / 2) - 450, (canvas.height / 2) - 300, 512, 211, 3);
backgroundObs.push(bg4);

function backgrounds_manager(camera) {
    var displacement = camera.topy - (canvas.height / 2);
    if (camera.y > canvas.height) {
        backgroundObs[1].y = 0;
    } else if (camera.y < canvas.height) {
        backgroundObs[1].y = -displacement;
    }
}

function drawbackgroundObs() {
    for (var i = 0; i < backgroundObs.length; i++) {
        backgroundObs[i].draw();
    }
}
//END BACKGROUND

//BAIT
var bait_array = [];

function Bait(x, y, vx, vy, ax, ay, time) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.alive = true;
    this.image = new Image();
    this.image.src = "http://i.imgur.com/WoDZo0y.png";
    /*
    this.display = new Image();
    this.display.src = "";
    */
    //this.Max_speed = 10;
    this.tempVel = new PVector(vx, vy);
    this.velocity = new PVector(vx, vy);
    this.accelation = new PVector(ax, ay);
    this.lifetime = 0;
    this.DEAD_TIME = time;
}

Bait.prototype.draw = function () {
    context.fillStyle = "black";
    if (this.alive) context.drawImage(this.image, myX(this.x), myY(this.y), this.width, this.height);
    // context.drawImage(this.display, myX(this.x), myY(this.y), this.width, this.height);
};

Bait.prototype.update = function () {
    if (this.lifetime > this.DEAD_TIME) this.alive = false;
    this.velocity.x += this.accelation.x;
    this.velocity.y += this.accelation.y;
    if ((this.tempVel.x < 0 && this.velocity.x < 0) || (this.tempVel.x > 0 && this.velocity.x > 0)) this.x += this.velocity.x;
    if ((this.tempVel.y < 0 && this.velocity.y < 0) || (this.tempVel.y > 0 && this.velocity.y > 0)) this.y += this.velocity.y;
    this.boundaries();
    ++this.lifetime;
};

Bait.prototype.boundaries = function () {
    //Right Boundary
    if (this.x + this.width > WORLD_WIDTH) this.x = WORLD_WIDTH - this.width;
    //Left Boundary
    if (this.x < 0) this.x = 0;
    //Top Boundary
    if (this.y < 0 + canvas.height / 2) this.y = canvas.height / 2;
    //Bottom Boundary
    if (this.y + this.height > WORLD_HEIGHT) this.y = WORLD_HEIGHT - this.height;
};

Bait.prototype.checkcollision = function (obj2) {
    if ((this.x + this.width < obj2.x) || (this.x > obj2.x + obj2.width) ||
            (this.y + this.height < obj2.y) || (this.y > obj2.y + obj2.height)) {
        return false;
    }
    return true;
};
// END BAIT


//AI
function AI(x, y, herpderp) {
    this.x = x;
    this.y = y;
    this.width = 190 / 2;
    this.height = 100 / 2;
    this.alive = true;
    this.image = new Image();
    this.image.src = "https://i.imgur.com/KMOzvYc.png"; //left
    this.image_flip = new Image();
    this.image_flip.src = "https://i.imgur.com/J6TxZXa.png"; //rigth
    this.display = new Image();
    this.display.src = this.image_flip.src;
    this.Max_speed = 10;
    this.velocity = new PVector(0, 0);
    this.accelation = new PVector(1, 1);
    this.health = 132;  //for healthbar
    this.energy = 132;  //for batterybar
    this.inv_timer = 0;
    this.t = 0.3;
    this.ttimer = 0;
    this.tbool = true;
    this.canmove = true;
    this.sftimer = 0;
    this.damage = 5;
    this.thundercount = 0; //for jellyfish
    this.herpiestderpiest = herpderp;
    this.radius = herpderp.scanner;
}

var thunderboltblue = new Image(50, 50);
thunderboltblue.src = "https://www.dropbox.com/s/u5oz2j3xf3gcilj/electricuteblue.png?dl=1";

AI.prototype.draw = function () {
    //Scanner
    context.fillStyle = "rgba(0, 255, 0," + this.t + ")";
    context.beginPath();
    context.arc(myX(this.x + this.width / 2), myY(this.y + this.height / 2), this.radius, 0, 2 * Math.PI);
    context.fill();

    //Sbumarine
    context.save();
    if (this.inv_timer > 0) context.globalAlpha = 0.5;
    context.drawImage(this.display, myX(this.x), myY(this.y), this.width, this.height);
    context.restore();

    //Transparency by Damage
    if (attacked_by_jellyfish) {
        this.thundercount += 1;
        if (this.thundercount % 25 == 0) {
            context.drawImage(thunderboltblue, myX(this.x) + 10, myY(this.y) - 10, 65, 65);
        }
    }
};

AI.prototype.run = function () {

    //Player update
    this.accelation.x = 1 * this.herpiestderpiest.power;
    this.accelation.y = 1 * this.herpiestderpiest.power;
    this.damage = this.herpiestderpiest.damage;
    this.radius = this.herpiestderpiest.scanner;

    this.fullcollision();
    this.inv_timer--;

    //t timer
    if (this.tbool) {
        this.t -= 0.01;
        ++this.ttimer;
        if (this.ttimer >= 30) this.tbool = false;
    } else {
        this.t += 0.01;
        --this.ttimer;
        if (this.ttimer <= 0) this.tbool = true;
    }
    //Movement
    if (keyPressed[RIGHT_KEY_CODE])
        if (this.velocity.x <= this.Max_speed) {
            this.velocity.x += this.accelation.x; //x
            this.display = this.image_flip;
        }
    if (keyPressed[LEFT_KEY_CODE])
        if (this.velocity.x >= -this.Max_speed) {
            this.velocity.x -= this.accelation.x; // x
            this.display = this.image;
        }
    if (keyPressed[UP_KEY_CODE])
        if (this.velocity.y >= -this.Max_speed)
            this.velocity.y -= this.accelation.y; // y
    if (keyPressed[DOWN_KEY_CODE])
        if (this.velocity.y <= this.Max_speed)
            this.velocity.y += this.accelation.y; // y


    if (keyPressed[SPACE_KEY_CODE]) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.canmove = false;

        //Kill Starfish
        for (var p = 0; p < starfisharray.length; ++p) {
            var check = false;
            check = this.checkcollisionradius(starfisharray[p]);
            if (check) {
                this.sftimer += this.damage;
                // console.log(this.sftimer);
                if (this.sftimer >= 100) {
                    this.sftimer = 0;
                    starfisharray.splice(p, 1);
                    //FOUND THE hwPlayer!!!
                    this.herpiestderpiest.score += 100;
                }
            }
        }

    } else {
        this.canmove = true;
        this.sftimer = 0;
    }


    if (!keyPressed[RIGHT_KEY_CODE] && !keyPressed[LEFT_KEY_CODE]) {
        if (this.velocity.x < 0) {
            this.velocity.x += this.accelation.x;
            if (this.velocity.x > 0) this.velocity.x = 0;
        }
        else if (this.velocity.x > 0) {
            this.velocity.x -= this.accelation.x;
            if (this.velocity.x < 0) this.velocity.x = 0;
        }
    }

    if (!keyPressed[UP_KEY_CODE] && !keyPressed[DOWN_KEY_CODE]) {
        if (this.velocity.y < 0) {
            this.velocity.y += this.accelation.x;
            if (this.velocity.y > 0) this.velocity.y = 0;
        }
        else if (this.velocity.y > 0) {
            this.velocity.y -= this.accelation.x;
            if (this.velocity.y < 0) this.velocity.y = 0;
        }
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    //END Movement
};

//Event Listeners

var RIGHT_KEY_CODE = 68;//d
var LEFT_KEY_CODE = 65;//a
var UP_KEY_CODE = 87;//w
var DOWN_KEY_CODE = 83;//s
var JREPEL_KEY_CODE = 81; //q
var SPACE_KEY_CODE = 32;//spacebar

var keyPressed = {};
keyPressed[RIGHT_KEY_CODE] = false;
keyPressed[LEFT_KEY_CODE] = false;
keyPressed[UP_KEY_CODE] = false;
keyPressed[DOWN_KEY_CODE] = false;
keyPressed[JREPEL_KEY_CODE] = false;
keyPressed[SPACE_KEY_CODE] = false;

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

function onKeyDown(eventParams) {
    if (eventParams.keyCode in keyPressed)
        keyPressed[eventParams.keyCode] = true;

    if (keyPressed[eventParams.keyCode] == keyPressed[JREPEL_KEY_CODE]
      && keyPressed[JREPEL_KEY_CODE] && Q_timer < 0 && hwPlayer.q) {
        q_was_pressed = true;

    }
}

function onKeyUp(eventParams) {
    if (eventParams.keyCode in keyPressed)
        keyPressed[eventParams.keyCode] = false;
}

//AI array
var AIarray = [];

//Collision
AI.prototype.fullcollision = function () {
    this.boundaries();
};

AI.prototype.boundaries = function () {
    //Right Boundary
    if (this.x + this.width > WORLD_WIDTH) this.x = WORLD_WIDTH - this.width;
    //Left Boundary
    if (this.x < 0) this.x = 0;
    //Top Boundary
    if (this.y < 0 + canvas.height / 2) this.y = canvas.height / 2;
    //Bottom Boundary
    if (this.y + this.height > WORLD_HEIGHT) this.y = WORLD_HEIGHT - this.height;
};

AI.prototype.checkcollision = function (obj2) {
    if ((this.x + this.width < obj2.x) || (this.x > obj2.x + obj2.width) ||
  			(this.y + this.height < obj2.y) || (this.y > obj2.y + obj2.height)) {
        return false;
    }
    return true;
};

AI.prototype.checkcollisionradius = function (obj2) { //not really a radius
    if ((this.x + this.radius * 2 < obj2.x) || (this.x - this.radius > obj2.x + obj2.width) ||
        (this.y + this.radius * 2 < obj2.y) || (this.y - this.radius > obj2.y + obj2.height)) {
        return false;
    }
    return true;
};


AI.prototype.OutOfBounds = function () {
    if (this.x < 0) this.x = 0;
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y > canvas.height - this.height) this.y = canvas.width - this.height;
};
//END Collision
//END AI


//SPRITE SHEET
function SpriteSheet(url, frameWidth, frameHeight, frameSpeed, endFrame, continous) {
    this.continous = continous; //plays continously if true
    this.endFrame = endFrame;
    this.currentFrame = 0;
    var image = new Image();
    var numFrames;
    var currentFrame = 0;
    var counter = 0;
    image.src = url;
    image.onload = function () {
        numFrames = Math.floor(image.width / frameWidth);
    };

    this.updatesprite = function () {
        if (counter == (frameSpeed - 1)) {
            currentFrame = (currentFrame + 1) % endFrame;
            this.currentFrame += 1;
        }
        counter = (counter + 1) % frameSpeed;
    };


    this.drawsprite = function (x, y) {
        if (this.currentFrame < this.endFrame || this.continous) {
            var row = Math.floor(currentFrame / numFrames);
            var col = Math.floor(currentFrame % numFrames);
            context.drawImage(image, col * frameWidth, row * frameHeight, frameWidth, frameHeight, x - frameWidth / 2, y - frameHeight / 2, frameWidth, frameHeight);
        }
    };
}
//END SPRITE SHEET

//JELLYFISH
var jellyfishcounter = 0; //maintains diversity of jellyfish
var current_amount_jellyfish = 0;
var max_amount_jellyfish = 30;
var q_was_pressed = false;//keyPressed[JREPEL_KEY_CODE]; 

function jellyfish(x, y) {
    this.x = x;
    this.y = y;
    this.width = 15;
    this.height = 17;
    this.direction = true; //true = up  // false = down
    this.selftimer = 0;
    this.src = smalljelly.src;
    this.attacking = false;
    this.being_repelled = false;
    this.xslope = 0;
    this.yslope = 0;
    this.type = 0; // 0 = small // 1 = med // 2 = large //
    this.framespeed = 4;
    this.endframe = 4;
    this.continous = true;
    this.ex = Math.random() * player1.width;
    this.ey = Math.random() * player1.height;
    this.sheet = new SpriteSheet(this.src, this.width, this.height, this.framespeed, this.endframe, this.continous);
    jellyfishcounter += 1;
    this.ax = 0;
    this.ay = 0;
}

//Jellyfish imagaes
var smalljelly = new Image(15, 17);
smalljelly.src = "https://www.dropbox.com/s/o48csq8kf7ast6f/bluejellysmall.png?dl=1";
var jellyfisharray = []; //ALL jelly fish are stored here
var attacked_by_jellyfish = false; //jellyfish_attacking
function createJellyfish(x, y) {
    var test = new jellyfish(x, y);
    jellyfisharray.push(test);
}

function jellyfish_generator(x, y) {
    this.x;
    this.y;
    this.direction; //1 is right 2 is left
}

jellyfish_generator.prototype.run = function () {
    this.x = worldCamera.x * 2;
    this.y = worldCamera.bottomy - 20;
    if (current_amount_jellyfish < max_amount_jellyfish) {
        createJellyfish(Math.random() * this.x, 500 + (Math.random() * this.y));
        current_amount_jellyfish += 1;
    }
};

function updateJellyfish() {
    if (jellyfisharray.length < 1) return;
    for (var d = 0; d < jellyfisharray.length; ++d) {
        jellyfisharray[d].update();
    }
    q_was_pressed = false;
    for (var p = 0; p < jellyfisharray.length; ++p) {
        if (jellyfisharray[p].attacking) {
            attacked_by_jellyfish = true;
            break;
        } else {
            attacked_by_jellyfish = false;
        }
    }


}
jellyfish.prototype.borders = function () {
    if (this.x < 0)
        this.x = 0;
    else if (this.x + this.width > WORLD_WIDTH)
        this.x = WORLD_WIDTH - this.width;
    if (this.y < canvas.height / 2)
        this.y = canvas.height / 2;
    else if (this.y + this.height > WORLD_HEIGHT)
        this.y = WORLD_HEIGHT - this.height;
};
jellyfish.prototype.update = function () {
    this.borders();
    if (!this.being_repelled) {
        if (player1.checkcollision(this)) {
            this.attacking = true;
            this.x = (Math.random() * 5) + this.ex + player1.x;
            this.y = (Math.random() * 5) + this.ey + player1.y;
            player1.health -= .08;
            attacked_by_jellyfish = true;
            if (player1.health < 0) player1.health = 0;
        } else {
            this.attacking = false;
        }
    }

    if (player1.checkcollision(this) && q_was_pressed) {
        //var angle = new PVector(Math.random(2)-1,Math.random(2)-1);
        var speedx = Math.round(Math.cos(Math.random() * 2 * Math.PI));
        var speedy = Math.round(Math.sin(Math.random() * 2 * Math.PI));
        if (speedx == 0 && speedy == 0) {
            speedx = 1;
            speedy = 1;
        }
        this.xslope = 15 * speedx; // accel X, either 1, 0, -1
        this.yslope = 15 * speedy;

        this.ax = -speedx;
        this.ay = -speedy;
        this.being_repelled = true;
        Q_timer = 75;
    }

    if (this.being_repelled) { // actaul movemnt
        this.x += this.xslope;
        this.y += this.yslope;
        this.attacking = false;
    } else {
        // basic movement 
        //flowing up and down
        switch (this.direction) {
            case true:
                this.y += .5;
                break;
            case false:
                this.y -= .5;
                break;
        }


        if (!this.attacking) {
            switch (this.selftimer % 10) {
                case 0:
                    this.x += 3;
                    break;
                case 1:
                    this.x -= 3;
                    break;
            }
        }
        this.selftimer += 1;
        if (this.selftimer % 20 == 0) {

            this.direction = !this.direction;
        }
    } // end movemnt 

    if (Math.abs(this.xslope) > 0 || Math.abs(this.yslope) > 0) {
        if (Math.abs(this.xslope) > 0) {
            this.xslope += this.ax;
        }
        if (Math.abs(this.yslope) > 0) {
            this.yslope += this.ay;
        }
    } else {
        this.being_repelled = false;
    }
};

function drawJellyfish() {
    if (jellyfisharray.length < 1) return;
    for (var d = 0; d < jellyfisharray.length; ++d) {
        if (jellyfisharray[d].type == 0) {
            jellyfisharray[d].sheet.updatesprite();
            jellyfisharray[d].sheet.drawsprite(myX(jellyfisharray[d].x), myY(jellyfisharray[d].y));
        }
    }

}
jellyfish.prototype.draw = function () {
    context.fillStyle = "rgba(0, 255, 0, 0.2)";
    context.drawImage(this.src, myX(this.x), myY(this.y), this.width, this.height);

};
//END JELLYFISH

//STARFISH
function starfish(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.speed;
    this.direction = Math.ceil(Math.random() * 4);
    this.randomdirectionarray = [1, 2, 3, 4];
    this.timer = Math.ceil(Math.random() * 31) - 1;
    this.shouldmove = false;
    this.firstcheck = 5;
    this.convertcheck = 20;
    this.image = new Image();
    this.image.src = "https://i.imgur.com/BNVrVxq.png?1";
}

starfish.prototype.draw = function () {
    context.drawImage(this.image, myX(this.x) - 10, myY(this.y) - 10, 30, 30);
};

starfish.prototype.update = function () {
    this.timer++;
    //move if already gray
    if (this.timer == this.firstcheck) {
        var noahisdabes = get_2dar(this.x, this.y, obstacles3);
        var noahtestes = noahisdabes instanceof obstacle;
        if (noahtestes && noahisdabes.fs == "grey") this.shouldmove = true;
    }
    //move if not already moved
    if (this.timer >= this.convertcheck) {
        this.shouldmove = true;
        this.timer = 0;
        this.convert();
    }

    if (this.predictmove(1, obstacles4) || !this.predictmove(1, obstacles3)) {
        for (var s = 0; s < this.randomdirectionarray.length; ++s) {
            if (this.randomdirectionarray[s] == 1) this.randomdirectionarray.splice(s, 1);
        }
    }
    if (this.predictmove(2, obstacles4) || !this.predictmove(2, obstacles3)) {
        for (var s = 0; s < this.randomdirectionarray.length; ++s) {
            if (this.randomdirectionarray[s] == 2) this.randomdirectionarray.splice(s, 1);
        }
    }
    if (this.predictmove(3, obstacles4) || !this.predictmove(3, obstacles3)) {
        for (var s = 0; s < this.randomdirectionarray.length; ++s) {
            if (this.randomdirectionarray[s] == 3) this.randomdirectionarray.splice(s, 1);
        }
    }
    if (this.predictmove(4, obstacles4) || !this.predictmove(4, obstacles3)) {
        for (var s = 0; s < this.randomdirectionarray.length; ++s) {
            if (this.randomdirectionarray[s] == 4) this.randomdirectionarray.splice(s, 1);
        }
    }

    this.direction = this.randomdirectionarray[Math.ceil(Math.random() * this.randomdirectionarray.length) - 1];
    if (!this.direction == 1 || !this.direction == 2 || !this.direction == 3 || !this.direction == 4) {
        this.direction = Math.ceil(Math.random() * 4);
    }

    this.restorerandomdirectionarray();

    if (this.shouldmove == true) {
        switch (this.direction) {
            case 1:
                this.direction = Math.ceil(Math.random() * 4);
                this.y -= 10;
                this.shouldmove = false;
                break;
            case 2:
                this.direction = Math.ceil(Math.random() * 4);
                this.x += 10;
                this.shouldmove = false;
                break;
            case 3:
                this.direction = Math.ceil(Math.random() * 4);
                this.y += 10;
                this.shouldmove = false;
                break;
            case 4:
                this.direction = Math.ceil(Math.random() * 4);
                this.x -= 10;
                this.shouldmove = false;
                break;
        }
    }

    this.OutOfBounds();

};

starfish.prototype.convert = function () {
    var target = get_2dar(this.x, this.y, obstacles3);
    if (target instanceof obstacle) {
        if (!(target.fs == "grey")) {
            target.fs = "grey";
            --REEF_HEALTH;
        }
    }
};

starfish.prototype.predictmove = function (direct, num) {
    switch (direct) {
        case 1:
            return get_2dar(this.x, this.y - 10, num);
            break;
        case 2:
            return get_2dar(this.x + 10, this.y, num);
            break;
        case 3:
            return get_2dar(this.x, this.y + 10, num);
            break;
        case 4:
            return get_2dar(this.x - 10, this.y, num);
            break;
    }
};

starfish.prototype.restorerandomdirectionarray = function () {
    this.randomdirectionarray = [1, 2, 3, 4];
};

starfish.prototype.OutOfBounds = function () {
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > WORLD_WIDTH) this.x = WORLD_WIDTH - this.width;
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > WORLD_HEIGHT) this.y = WORLD_HEIGHT - this.height;
};


//END STARFISH

//STARFISH ARRAY

function createStarfish(times) {
    while (times > 0) {
        var randomx = Math.ceil((300 + Math.random() * (WORLD_WIDTH - 600)) / 10) * 10;
        var randomy = Math.ceil((900 + Math.random() * (WORLD_HEIGHT - 1200)) / 10) * 10;
        var test = new starfish(randomx, randomy);
        starfisharray.push(test);
        --times;
    }
}
var starfisharray = [];

function drawStarfish() {
    if (starfisharray.length < 1) return;
    for (var d = 0; d < starfisharray.length; ++d) {
        starfisharray[d].draw();
    }
}

function updateStarfish() {
    if (starfisharray.length < 1) return;
    for (var d = 0; d < starfisharray.length; ++d) {
        starfisharray[d].update();
    }
}
//END STARFISH ARRAY

//BEGIN HIU IMPORTS

//=======================================================================
//SHARK

var sharkarray = [];

function drawSharks() {
    for (var hiuru = 0; hiuru < sharkarray.length; ++hiuru) {
        sharkarray[hiuru].draw();
    }
};

function updateSharks() {
    for (var hiuru = 0; hiuru < sharkarray.length; ++hiuru) {
        sharkarray[hiuru].update();
    }
}

function shark(x, y) {
    // general var
    this.x = x;
    this.y = y;
    this.width = 120;
    this.height = 40;
    this.direction = true; //true is right, false is left
    this.radius = this.width; // dection radius;
    this.normal_speed = 5;
    this.speedx = 5;//Math.round( Math.random() * 2 );
    this.speedy = 0;
    this.image = new Image();
    this.image.src = "http://i.imgur.com/ZQrQBCG.png"; // shark

    // attack var
    this.MAX_SPEED = 10; // constant MAX attack speed of shark
    this.rcolor = "rgba(0, 255, 0, 0.2)"; // for testing only
    this.attack = false;
    this.attack_speedx = 0;
    this.attack_speedy = 0;
    this.accel_x = 0;
    this.accel_y = 0;
    this.NOR_ACC = 1; // normal accelation
    this.reach_Max_Speed = false;
    this.x_dir = 0;
    this.y_dir = 0;
    this.attack_interval = 50;
    this.timer = this.attack_interval;

    sharkarray.push(this);
}

//Calculate if the player is inside the detection circle
shark.prototype.checkcollisionradius = function (x, y, width, height) {
    // calc the center of the shark
    var centerx = this.x + (this.width / 2);
    var centery = this.y + (this.height / 2);
    // detect collision
    if (dist(x, y, centerx, centery) < this.radius ||
  	 dist(x + width, y, centerx, centery) < this.radius ||
     dist(x + width, y + height, centerx, centery) < this.radius ||
     dist(x, y + height, centerx, centery) < this.radius) {
        return true;
    }
    return false;
};

// determeint the direction of the obj if in range
shark.prototype.ATK_Direction = function (obj) {
    if (!this.attack) {
        this.x_dir = this.X_Direction(obj); // check where the player is
        this.y_dir = this.Y_Direction(obj); // check where the player is
        if (this.x_dir != 1 || this.y_dir != 1) { this.attack = true; }
        this.timer = 0;
    }
};

// Calc the x direction
shark.prototype.X_Direction = function (obj) {
    var x_dis = (obj.x + obj.width / 2) - (this.x + this.width / 2);
    if (Math.abs(x_dis) < (obj.width / 2 + this.width / 2)) x_dis = 0;
    if (x_dis < 0) { return 0; }// player on left
    else if (x_dis == 0) { return 1; } // player on top or bottom
    else if (x_dis > 0) { return 2; }// player on right
};
// Calc the y direction
shark.prototype.Y_Direction = function (obj) {
    var y_dis = (obj.y + obj.height / 2) - (this.y + this.height / 2);
    if (Math.abs(y_dis) < (obj.height / 2 + this.height / 2)) y_dis = 0;
    if (y_dis < 0) { return 0; }// player above
    else if (y_dis == 0) { return 1; } // player on left of right
    else if (y_dis > 0) { return 2; }// player below
};

shark.prototype.bound_check = function () {
    if (this.x < 0) {
        this.x = 0;
        this.direction = !this.direction;
    } else if (this.x + this.width > WORLD_WIDTH) {
        this.x = WORLD_WIDTH - this.width;
        this.direction = !this.direction;
    }
    if (this.y < canvas.height / 2) this.y = canvas.height / 2;
    if (this.y + this.height > WORLD_HEIGHT) this.y = WORLD_HEIGHT - this.height;
};

shark.prototype.update = function () {
    // bound check
    this.bound_check();

    //detection check


    // check tp see if bait in range
    // if ture, set the num to iter
    var temp_num = null;
    for (var iter = 0; iter < bait_array.length; ++iter) {
        if (this.checkcollisionradius(bait_array[iter].x, bait_array[iter].y,
        bait_array[iter].width, bait_array[iter].height) && this.timer > this.attack_interval && bait_array[iter].alive) {
            temp_num = iter;
            break;
        }
    }

    if (temp_num != null) {
        this.ATK_Direction(bait_array[temp_num]);
    } else if (this.checkcollisionradius(player1.x, player1.y,
       player1.width, player1.height) && this.timer > this.attack_interval) { // check tp see if player in range
        this.ATK_Direction(player1);
    }

    if (this.attack) { // control the attack movement of the shark
        switch (this.x_dir) { // x accelation
            case 0: this.accel_x = -this.NOR_ACC; this.direction = false; break; //left
            case 1: this.accel_x = 0; break;//middle
            case 2: this.accel_x = this.NOR_ACC; this.direction = true; break; // right
        }
        switch (this.y_dir) { // y accelation
            case 0: this.accel_y = -this.NOR_ACC; break; // up
            case 1: this.accel_y = 0; break;//middle
            case 2: this.accel_y = this.NOR_ACC; break; // down
        }

        if (!this.reach_Max_Speed) { // if not reaching the max speed
            this.attack_speedx += this.accel_x; //speed up
            this.attack_speedy += this.accel_y;
            if (Math.abs(this.attack_speedx) > this.MAX_SPEED ||
                Math.abs(this.attack_speedy) > this.MAX_SPEED)
                this.reach_Max_Speed = true;
        } else { // eles if reached the max speed
            this.attack_speedx -= this.accel_x; // slow down
            this.attack_speedy -= this.accel_y;
            // reaching the end of attack
            if ((this.attack_speedx == 0 && this.accel_x != 0) ||
                  (this.attack_speedy == 0 && this.accel_y != 0)) {
                this.attack_speedx = 0;
                this.attack_speedy = 0;
                this.attack = false;
                this.reach_Max_Speed = false;
            }
        }


        if (player1.checkcollision(this)) {
            if (player1.inv_timer <= 0) {
                player1.health -= 20; // energy is now health
                player1.inv_timer = 75;
                player1.velocity.x = Math.floor(this.attack_speedx * 1.5);
                player1.velocity.y = Math.floor(this.attack_speedy * 1.5);
            }
        }
        for (var iter = 0; iter < bait_array.length; ++iter) {
            if (bait_array[iter].checkcollision(this)) {
                bait_array[iter].alive = false;
            }
        }// end of for loop
    } // end of attack movment contorl


    switch (this.direction) { // control the basic movement of the shark
        case true:
            this.speedx = this.normal_speed;
            break;
        case false:
            this.speedx = -1 * this.normal_speed;
            break;
    }

    this.x += this.speedx + this.attack_speedx;
    this.y += this.attack_speedy;
    this.timer++;
};

shark.prototype.draw = function () {
    context.save();
    context.translate(myX(this.x + this.width / 2), myY(this.y + this.height / 2));
    if (this.speedx > 0) context.scale(-1, 1); // Set scale to flip the image
    context.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    context.translate(-myX(this.x + this.width / 2), -myY(this.y + this.height / 2)); // Move registration point back to the top left corner of world
    context.restore();
};

// find distance between two points
function dist(point1x, point1y, point2x, point2y) {
    return Math.sqrt(Math.pow((point1x - point2x), 2) + Math.pow((point1y - point2y), 2));
}

// END SHARK
//=======================================================================

//=======================================================================
//Fish
var flock = new Flock();
var fish_width = 20;
var fish_height = 10;
var NUM_OF_FISH = 100;
var Fish_Sprite = ["http://i.imgur.com/5felGVu.png",  // orange fish
                    "http://i.imgur.com/xtVlPuO.png",  //blue fish
                    "http://i.imgur.com/sOFVylz.png",  // purple fish
];

function setup() {
    flock = new Flock();
    // Add an initial set of boids into the system
    for (var i = 0; i < NUM_OF_FISH; ++i) {
        flock.addBoid(new Boid(Math.random() * WORLD_WIDTH, (Math.random() * (WORLD_HEIGHT - canvas.height / 2)) + canvas.height / 2));
    }
}

function Flock() {
    this.boids = []; // An ArrayList for all the boids

    this.run = function () {
        for (var iter = 0; iter < this.boids.length; ++iter) {
            this.boids[iter].run(this.boids);  // Passing the entire list of boids to each boid individually
        }
    };
    this.draw = function () {
        for (var iter = 0; iter < this.boids.length; ++iter) {
            this.boids[iter].render();
        }
    };

    this.addBoid = function (b) {
        this.boids.push(b);
    };

}

function Boid(x, y) {
    this.angle = Math.random() * 2 * Math.PI;
    this.location = new PVector(x, y);
    this.velocity = new PVector(Math.cos(this.angle), Math.sin(this.angle));
    this.acceleration = new PVector(0, 0);
    this.r = 3;
    this.width = fish_width;
    this.height = fish_height;
    this.maxforce = 0.05;    // Maximum steering force
    this.maxspeed = 5;    // Maximum speed

    this.image = new Image();
    this.image.src = Fish_Sprite[Math.floor(Math.random() * Fish_Sprite.length)]; // [0, 1)

    this.run = function (boids) {
        this.flock(boids);
        this.update();
        this.shark_avoid();
        this.borders();
        this.render();
    };

    this.applyForce = function (force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    };

    // We accumulate a new acceleration each time based on three rules
    this.flock = function (boids) {
        var sep = this.separate(boids);   // Separation
        var ali = this.align(boids);      // Alignment
        var coh = this.cohesion(boids);   // Cohesion
        // Arbitrarily weight these forces
        sep.mult(1.5);
        ali.mult(1.0);
        coh.mult(1.0);
        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    };

    // Method to update location
    this.update = function () {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.location.add(this.velocity);
        // Reset accelertion to 0 each cycle
        this.acceleration.mult(0);
    };

    // A method that calculates and applies a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    this.seek = function (target) {
        var desired = new PVector(target.x - this.location.x, target.y - this.location.y);  // A vector pointing from the location to the target
        // Scale to maximum speed
        desired.normalize();
        desired.mult(this.maxspeed);

        // Above two lines of code below could be condensed with new PVector setMag() method
        // Not using this method until Processing.js catches up
        // desired.setMag(maxspeed);

        // Steering = Desired minus Velocity
        var steer = new PVector(desired.x - this.velocity.x, desired.y - this.velocity.y);
        steer.limit(this.maxforce);  // Limit to maximum steering force
        return steer;
    };

    this.render = function () {
        var scaleH = -1, // Set horizontal scale to -1 to flip horizontal
            scaleV = (this.velocity.x < 0) ? -1 : 1; // Set verical scale to -1 if flip vertical
        // Draw a triangle rotated in the direction of velocity
        var theta = this.velocity.heading();// + 90* Math.PI / 180; // for triangle
        context.save();
        context.translate(myX(this.location.x), myY(this.location.y));
        context.rotate(theta);
        //context.fillStyle = "darkgrey";
        //context.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        context.scale(scaleH, scaleV); // Set scale to flip the image
        context.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        context.translate(-myX(this.location.x), -myY(this.location.y)); // Move registration point back to the top left corner of world
        context.restore();
    };

    // Wraparound or changing direction if hitting the bound
    this.borders = function () {
        if (this.location.x < 0 + this.r) {
            this.velocity.x += 0.1;
        }
        if (this.location.y < canvas.height / 2 + 20 + this.r) {
            this.velocity.y += 0.5;
        }
        else if (this.location.y < canvas.height / 2) {
            this.velocity.y += 1;
        }
        if (this.location.x > WORLD_WIDTH - this.r) {
            this.velocity.x += -0.11;
        }
        if (this.location.y > WORLD_HEIGHT - this.r) {
            this.velocity.y += -0.1;
        }
    };

    this.shark_avoid = function () {
        for (var ittybitty = 0; ittybitty < sharkarray.length; ++ittybitty) {
            if (sharkarray[ittybitty].checkcollisionradius(this.location.x, this.location.y, 0, 0)) {
                var center_x = sharkarray[ittybitty].x + (sharkarray[ittybitty].width / 2);
                var center_y = sharkarray[ittybitty].y + (sharkarray[ittybitty].height / 2);
                if (this.location.y <= center_y) { this.velocity.y -= 0.2; }
                else { this.velocity.y += 0.2; }
                if (this.location.x <= center_x) { this.velocity.x -= 0.2; }
                else { this.velocity.x += 0.2; }
            }
        }
    };

    // Separation
    // Method checks for nearby boids and steers away
    this.separate = function (boids) {
        var desiredseparation = 25;
        var steer = new PVector(0, 0);
        var count = 0;
        // For every boid in the system, check if it's too close
        for (var i = 0; i < boids.length; i++) {
            var d = this.location.dist(boids[i].location);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                var diff = new PVector(this.location.x - boids[i].location.x, this.location.y - boids[i].location.y);
                diff.normalize();
                diff.div(d);        // Weight by distance
                steer.add(diff);
                count++;            // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // First two lines of code below could be condensed with new PVector setMag() method
            // Not using this method until Processing.js catches up
            // steer.setMag(maxspeed);

            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;
    };

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    this.align = function (boids) {
        var neighbordist = 50;
        var sum = new PVector(0, 0);
        var count = 0;
        for (var j = 0; j < boids.length; j++) {
            var d = this.location.dist(boids[j].location);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[j].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            // First two lines of code below could be condensed with new PVector setMag() method
            // Not using this method until Processing.js catches up
            // sum.setMag(maxspeed);

            // Implement Reynolds: Steering = Desired - Velocity
            sum.normalize();
            sum.mult(this.maxspeed);
            var steer = new PVector(sum.x - this.velocity.x, sum.y - this.velocity.y); //PVector steer
            steer.limit(this.maxforce);
            return steer;
        }
        else {
            return new PVector(0, 0);
        }
    };

    // Cohesion
    // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
    this.cohesion = function (boids) {
        var neighbordist = 50;
        var sum = new PVector(0, 0);   // Start with empty vector to accumulate all locations
        var count = 0;
        for (var i = 0; i < boids.length; i++) {
            var d = this.location.dist(boids[i].location); // int
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].location); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum);  // Steer towards the location
        }
        else {
            return new PVector(0, 0);
        }
    };
}

function PVector(x, y) {
    this.x = x;
    this.y = y;

    this.add = function (v) {
        this.x += v.x;
        this.y += v.y;
    };

    this.sub = function (v) {
        this.x -= v.x;
        this.y -= v.y;
    };

    this.mult = function (n) {
        this.x *= n;
        this.y *= n;
    };

    this.div = function (n) {
        if (n != 0) {
            this.x /= n;
            this.y /= n;
        }
    };

    this.normalize = function () {
        var magi = this.mag();
        if (magi > 0) {
            this.x /= magi;
            this.y /= magi;
        }
    };

    this.limit = function (max) {
        var lengthSquared = Math.pow(this.x, 2) + Math.pow(this.y, 2);
        if ((lengthSquared > Math.pow(max, 2)) && (lengthSquared > 0)) {
            var ratio = max / Math.sqrt(lengthSquared);
            this.x *= ratio;
            this.y *= ratio;
        }
    };

    this.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    this.dist = function (v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    };

    this.heading = function () {
        if (this.x == 0) {
            if (this.y < 0) {
                return -Math.PI / 2;
            } else {
                return Math.PI / 2;
            }
        } else {
            if (this.x > 0) {
                return Math.atan(this.y / this.x);
            } else {
                return Math.PI + Math.atan(this.y / this.x);
            }
        }
    };
}

//END Fish
//=======================================================================

//=======================================================================
//TURTLES

var turtlearray = [];

function drawTurtles() {
    for (var hiuru = 0; hiuru < turtlearray.length; ++hiuru) {
        turtlearray[hiuru].draw();
    }
};

function updateTurtles() {
    for (var hiuru = 0; hiuru < turtlearray.length; ++hiuru) {
        turtlearray[hiuru].update();
    }
}

function Turtles(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alive = true;
    this.color = "green";
    this.MAX_TIME = 100;
    this.speed = 2;
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.accelation_x = 0;
    this.accelation_y = 0;
    this.timer = 30;
    this.alive = true;
    this.image = new Image();
    this.image.src = "https://i.imgur.com/e20J5UW.png"; //left
    this.image_flip = new Image();
    this.image_flip.src = "https://i.imgur.com/m2D4B52.png"; //right
    this.display = new Image();
    this.display.src = "https://i.imgur.com/m2D4B52.png"; // what is displayed

    turtlearray.push(this);

    this.border = function () {
        // Make sure not going into player
        if (this.checkCollision(player1)) {
            var max_dx = this.width / 2 + player1.width / 2;
            var max_dy = this.height / 2 + player1.height / 2;
            var pcx = player1.x + player1.width / 2;
            var pcy = player1.y + player1.height / 2;
            var cx = this.x + this.width / 2;
            var cy = this.y + this.height / 2;
            var dx = Math.abs((cx - pcx)) - max_dx;
            var dy = Math.abs((cy - pcy)) - max_dy;
            //console.log(dx,dy);
            if (cy >= pcy) {
                if (cx >= pcx) {
                    if (dx < dy) {
                        this.y = pcy + player1.height / 2;
                    } else {
                        this.x = pcx + player1.width / 2;
                    }
                } else {
                    if (dx < dy) {
                        this.y = pcy + player1.width / 2;
                    } else {
                        this.x = player1.x - this.width;
                    }
                }
            } else {
                if (cx >= pcx) {
                    if (dx < dy) {
                        this.y = player1.y - this.height;
                    } else {
                        this.x = pcx + player1.width / 2;
                    }
                } else {
                    if (dx < dy) {
                        this.y = player1.y - this.height;
                    } else {
                        this.x = player1.x - this.width;
                    }
                }
            }
        } else {
            if (this.x < 0) {
                this.x = 0;
                this.velocity_x = 0;
                this.accelation_x = 1;
            }
            else if (this.x + this.width > WORLD_WIDTH) {
                this.x = WORLD_WIDTH - this.width;
                this.velocity_x = 0;
                this.accelation_x = -1;
            }
            if (this.y < canvas.height / 2) {
                this.y = canvas.height / 2;
                this.velocity_y = 0;
                this.accelation_y = 1;
            }
            else if (this.y + this.height > WORLD_HEIGHT) {
                this.y = WORLD_HEIGHT - this.height;
                this.velocity_y = 0;
                this.accelation_y = -1;
            }
        }

    };

    this.update = function () {
        // check border
        this.border();
        this.move(); // calculate the accel and speed
        this.hit_check(); // check if it is being hit by player 
        if (this.velocity_x >= 0) {
            this.display = this.image_flip;
        } else {
            this.display = this.image;
        }
        this.x += this.velocity_x; // move the actual coordinate
        this.y += this.velocity_y;
    };

    this.hit_check = function () {
        // if(this.timer > 30){
        var tempx = this.velocity_x;
        var tempy = this.velocity_y;
        if (this.checkCollision(player1)) {
            this.timer = 0;
            if (player1.velocity.x == 0 && player1.velocity.y == 0) {
                this.velocity_x *= -1;
                this.velocity_y *= -1;
                this.timer = this.MAX_TIME;
            } else {
                this.velocity_x = player1.velocity.x;
                this.velocity_y = player1.velocity.y;
            }
            REEF_HEALTH -= 50;
            player1.velocity.x = tempx;//Math.floor(-player1.velocity.x/4);
            player1.velocity.y = tempy; //Math.floor(-player1.velocity.y/4);
        }
        //  }   
    };

    this.checkCollision = function (obj2) {
        if ((this.x + this.width < obj2.x) || (this.x > obj2.x + obj2.width) ||
                (this.y + this.height < obj2.y) || (this.y > obj2.y + obj2.height)) {
            return false;
        }
        return true;
    };

    this.move = function () {
        this.timer++;
        if (this.timer > this.MAX_TIME) {
            this.timer = 0;
            this.accelation_x = (Math.floor(Math.random() * 3) - 1) * 1;
            this.accelation_y = (Math.floor(Math.random() * 3) - 1) * 1;

        }
        if (this.velocity_x == 0 && this.velocity_y == 0 &&
           this.accelation_x == 0 && this.accelation_x == 0) {
            this.velocity_x = 1;
        }
        // X-direction
        if (Math.abs(this.velocity_x) < this.speed) {
            this.velocity_x += this.accelation_x;
        } else if (Math.abs(this.velocity_x) > this.speed) {
            if (this.velocity_x > 0) {
                if (this.accelation_x < 0) {
                    this.velocity_x += this.accelation_x;
                } else {
                    this.velocity_x -= this.accelation_x;
                }
            } else {
                if (this.accelation_x < 0) {
                    this.velocity_x -= this.accelation_x;
                } else {
                    this.velocity_x += this.accelation_x;
                }
            }
        }
        //Y-direction
        if (Math.abs(this.velocity_y) < this.speed) {
            this.velocity_y += this.accelation_y;
        } else if (Math.abs(this.velocity_y) > this.speed) {
            if (this.velocity_y > 0) {
                if (this.accelation_y < 0) {
                    this.velocity_y += this.accelation_y;
                } else {
                    this.velocity_y -= this.accelation_y;
                }
            } else {
                if (this.accelation_y < 0) {
                    this.velocity_y -= this.accelation_y;
                } else {
                    this.velocity_y += this.accelation_y;
                }
            }
        }
    };

    this.draw = function () {
        context.drawImage(this.display, myX(this.x), myY(this.y), this.width, this.height);
    };
}
//END TURTLES
//=======================================================================

//======================================================================
// CURRENT 
var currents = new Array();
function current(x, y, width, height, speed, dir, fillStyle, numParticles) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = dir;
    this.fillStyle = fillStyle;
    this.numParticles = numParticles;
    this.particles = new Array();

    this.update = function () {
        if (this.checkCollision(player1)) {
            this.movePlayer(player1);
        }
        /*
        for(var tt = 0; tt < turtlearray.length; ++tt){
            if(this.checkCollision(turtlearray[tt])){
                this.movePlayer(turtlearray[tt]);
            }
        }
        for(var st = 0; st < sharkarray.length; ++st){
            if(this.checkCollision(sharkarray[st])){
                this.movePlayer(sharkarray[st]);
            }
        }
        */
    };

    currents.push(this);
    this.createParticleSystem();
}

current.prototype.createParticleSystem = function () {
    if (this.direction == "up") {
        for (var iter = 0; iter < this.numParticles; iter++) {
            this.particles.push(new Particle(this.x + (Math.random() * this.width), this.y + (Math.random() * this.height), (Math.random() + 1) * 20, (Math.random() + .2) * 5, (Math.random() + .8) * this.speed, this.direction));
        }
    } else if (this.direction == "down") {
        for (var iter = 0; iter < this.numParticles; iter++) {
            this.particles.push(new Particle(this.x + (Math.random() * this.width), this.y + (Math.random() * this.height), (Math.random() + 1) * 20, (Math.random() + .2) * 5, (Math.random() + .8) * this.speed, this.direction));
        }
    } else if (this.direction == "left") {
        for (var iter = 0; iter < this.numParticles; iter++) {
            this.particles.push(new Particle(this.x + (Math.random() * this.width), this.y + (Math.random() * this.height), (Math.random() + .2) * 5, (Math.random() + 1) * 20, (Math.random() + .8) * this.speed, this.direction));
        }
    } else if (this.direction == "right") {
        for (var iter = 0; iter < this.numParticles; iter++) {
            this.particles.push(new Particle(this.x + (Math.random() * this.width), this.y + (Math.random() * this.height), (Math.random() + .2) * 5, (Math.random() + 1) * 20, (Math.random() + .8) * this.speed, this.direction));
        }
    }
};

current.prototype.animateUpdate = function () {
    if (this.direction == "up") {
        for (var iter = 0; iter < this.particles.length; iter++) {
            if (this.particles[iter].y + this.particles[iter].height < this.y) {
                this.particles[iter].x = this.x + (Math.random() * this.width);
                this.particles[iter].y = this.y + this.height;
                this.particles[iter].fillStyle = colorPicker();
            }
            //context.clearRect(this.particles[iter].x,this.particles[iter].y -5,this.particles[iter].width + 5,this.particles[iter].height + 10);
            this.particles[iter].y -= this.particles[iter].speed;
        }
    }
    else if (this.direction == "down") {
        for (var iter = 0; iter < this.particles.length; iter++) {
            if (this.particles[iter].y > this.y + this.height) {
                this.particles[iter].x = this.x + (Math.random() * this.width);
                this.particles[iter].y = this.y;
                this.particles[iter].fillStyle = colorPicker();
            }
            //context.clearRect(this.particles[iter].x,this.particles[iter].y -5,this.particles[iter].width + 5,this.particles[iter].height + 10);
            this.particles[iter].y += this.particles[iter].speed;
        }
    }
    else if (this.direction == "left") {
        for (var iter = 0; iter < this.particles.length; iter++) {
            if (this.particles[iter].x + this.particles[iter].width < this.x) {
                this.particles[iter].x = this.x + this.width;
                this.particles[iter].y = this.y + (Math.random() * this.height);
                this.particles[iter].fillStyle = colorPicker();
            }
            //context.clearRect(this.particles[iter].x,this.particles[iter].y -5,this.particles[iter].width + 5,this.particles[iter].height + 10);
            this.particles[iter].x -= this.particles[iter].speed;
        }
    }
    else if (this.direction == "right") {
        for (var iter = 0; iter < this.particles.length; iter++) {
            if (this.particles[iter].x > this.x + this.width) {
                this.particles[iter].x = this.x;
                this.particles[iter].y = this.y + (Math.random() * this.height);
                this.particles[iter].fillStyle = colorPicker();
            }
            //context.clearRect(this.particles[iter].x,this.particles[iter].y -5,this.particles[iter].width + 5,this.particles[iter].height + 10);
            this.particles[iter].x += this.particles[iter].speed;
        }
    }
};

current.prototype.animateDraw = function () {
    for (var iter = 0; iter < this.particles.length; iter++) {
        context.fillStyle = this.particles[iter].fillStyle;
        context.fillRect(myX(this.particles[iter].x), myY(this.particles[iter].y), this.particles[iter].width, this.particles[iter].height);
    }
};

current.prototype.checkCollision = function (obj) {
    if ((this.x + this.width < obj.x) || (this.x > obj.x + obj.width) ||
  		(this.y + this.height < obj.y) || (this.y > obj.y + obj.height)) {
        return false;
    }
    return true;
};

current.prototype.movePlayer = function (obj) {
    if (this.direction == "left") {
        obj.x -= this.speed;
    } else if (this.direction == "right") {
        obj.x += this.speed;
    } else if (this.direction == "down") {
        obj.y += this.speed;
    } else if (this.direction == "up") {
        obj.y -= this.speed;
    }
};

function colorPicker() {
    var c = Math.floor(Math.random() * 5);
    var fs;
    switch (c) {
        case 0: fs = "rgba(127,255,212, 0.5)"; return fs; break;
        case 1: fs = "rgba(255, 255, 255, 0.5)"; return fs; break;
        case 2: fs = "rgba(0,255,255, 0.5)"; return fs; break;
        case 3: fs = "rgba(	0,206,209, 0.5)"; return fs; break;
        case 4: fs = "rgba(	0,128,128, 0.5)"; return fs; break;
        case 5: fs = "rgba(46,139,87, 0.5)"; return fs; break;
        default: fs = "rgba(0,206,209, 0.5)";
    }
}

function Particle(x, y, height, width, speed, dir) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.fillStyle = colorPicker();
    this.direction = dir;
}
//END CURRENT
//=======================================================================

//END HIU IMPORTS



//OBSTACLES
//Obstacles Textures

var obstacles_textures_links = [
  "https://i.imgur.com/lWJ7PEz.png", //pink
  "https://i.imgur.com/OZ2RzmP.png", //green
  "https://i.imgur.com/vp4eRYV.png", //rainbow
  "https://i.imgur.com/hbYWJuc.png", //red
  "https://i.imgur.com/LGeoZut.png", //rock
  "https://i.imgur.com/5ztU4bs.png", //stone
  "https://i.imgur.com/ySc0zaJ.png", //smooth stone
  "https://dl.dropbox.com/s/k8ql3er6s0l1avk/imageedit_5_77422848602.jpg",
  "https://dl.dropbox.com/s/h6td088he7k2z2q/imageedit_5_77422848603.jpg",
  "https://dl.dropbox.com/s/qbl6aldrcdhj24k/imageedit_5_77422848604.jpg"
];
var obstacles_textures = [];


//END Obstacles Textures

var obstacles1 = [];
var obstacles2 = [];

var obstacles3 = new Array(WORLD_WIDTH / 10);
var obstacles4 = new Array(WORLD_WIDTH / 10);

function make2darray(input) {
    for (var bender = 0; bender < input.length; ++bender) {
        input[bender] = new Array(WORLD_HEIGHT / 10);
    }
}

make2darray(obstacles3);
make2darray(obstacles4);

function push_2dar(obby, ar) {
    var tester = ar instanceof Array;
    var tester2 = ar[0].length;
    if (tester && tester2 > 0) ar[obby.x / 10][obby.y / 10] = obby;
}

function get_2dar(moisesx, moisesy, ar) {
    //we may need a way to affirm there is a coral here
    var tempx = (Math.ceil(moisesx / 10));
    var tempy = (Math.ceil(moisesy / 10));
    if (ar[tempx][tempy] instanceof obstacle) {
        return ar[tempx][tempy];
    } else {
        return false;
    }
}

function draw_2dar(ar) {
    for (var i1 = 0; i1 < ar.length; ++i1) {
        for (var i2 = 0; i2 < ar[i1].length; ++i2) {
            var testy = ar[i1][i2] instanceof obstacle;
            if (testy) ar[i1][i2].draw();
        }
    }
}


function obstacle(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.fs = c;
    this.image = c;
    this.col = (x - Math.floor(x / 400) * 400);//Math.floor(Math.random()*1160/40) *40;
    this.row = (y - Math.floor(y / 320) * 320);//Math.floor(Math.random()*880/40) *40;

}

obstacle.prototype.draw = function () {

    //context.drawImage(obstacles_textures[this.image], myX(this.x), myY(this.y), this.width, this.height);
    //context.fillStyle = this.fs;
    //context.fillRect(myX(this.x), myY(this.y), this.width, this.height);

    if (this.fs == "DeepPink") {
        context.drawImage(obstacles_textures[7], this.col, this.row, 10, 10, myX(this.x), myY(this.y), this.width, this.height);
    } else if (this.fs == "#8A2BE2") {
        context.drawImage(obstacles_textures[8], this.col, this.row, 10, 10, myX(this.x), myY(this.y), this.width, this.height);
    } else {
        //context.fillStyle = this.fs;
        //context.fillRect(myX(this.x), myY(this.y), this.width, this.height);
        context.drawImage(obstacles_textures[9], this.col, this.row, 10, 10, myX(this.x), myY(this.y), this.width, this.height);
    }

};

function drawObstacles() {

    for (var temp = 0; temp < obstacles1.length; temp++) {
        if (obstacles1[temp].y + obstacles1[temp].height < worldCamera.topy - 10) continue;
        obstacles1[temp].draw();
    }

    for (var temp = 0; temp < obstacles2.length; temp++) {
        if (obstacles2[temp].y + obstacles2[temp].height < worldCamera.topy - 10) continue;
        obstacles2[temp].draw();
    }
}
//END OBSTACLES



//CORAL GENERATOR
//Imported Code
//midpoint displacement
function terrain(random_range, roughness, points, start, end) {
    var n = start + end;
    if ((end - start) <= 1) return points;
    // calculating midpoint displacement
    // math.floor version
    //points[Math.floor(n/2)] = Math.floor((points[start]+points[end])/2 + (Math.random() * random_range * 2) - random_range);
    // round to the ten version
    points[Math.floor(n / 2)] = Math.round(((points[start] + points[end]) / 2 + (Math.random() * random_range * 2) - random_range) / 10) * 10;
    random_range *= roughness; // reduce random range
    // divide into two part
    // left
    var lstart = start;
    var lend = Math.floor(n / 2);
    var Ldisplaced = terrain(random_range, roughness, points, lstart, lend);
    // right
    var rstart = Math.floor(n / 2);
    var rend = end;
    var Rdisplaced = terrain(random_range, roughness, points, rstart, rend);
    return points;
}

function merge(L, R) {
    for (var k = 0; k < R.length; ++k) {
        L.push(R[k]);
    }
    return L;
}

var createDistance = 300;
var tempWall = new Array(createDistance / 10);
for (var i = 0; i < createDistance / 10; ++i) tempWall[i] = createDistance / 2;

var terPoints = terrain(createDistance / 4, 0.5, tempWall, 0, tempWall.length - 1);
//END Imported Code

function initialize_wall() {
    terPoints = [];
    terPoints = terrain(createDistance / Math.ceil(1 + Math.random() * 2.5), 0.5, tempWall, 0, tempWall.length - 1);
}

function create_wall_right(depth, startx, c, ar) {
    for (var t = 0; t < terPoints.length; t++) {
        for (var t2 = 0; t2 > -terPoints[t]; t2 -= 10) {
            var tempObs = new obstacle(0 + t2 + startx, t * 10 + depth, 10, 10, c);
            push_2dar(tempObs, ar);
        }
    }
    initialize_wall();
}

function create_wall_left(depth, startx, c, ar) {
    for (var t = 0; t < terPoints.length; ++t) {
        for (var t2 = 0; t2 < terPoints[t]; t2 += 10) {
            var tempObs = new obstacle(0 + startx + t2, t * 10 + depth, 10, 10, c);
            push_2dar(tempObs, ar);
        }
    }
    initialize_wall();
}

function create_wall_box(depth, startx, width, height, c, ar) {
    for (var t = 0; t < width; t += 10) {
        for (var t2 = 0; t2 < height; t2 += 10) {
            var tempObs = new obstacle(0 + startx + t2, t + depth, 10, 10, c);
            push_2dar(tempObs, ar);
        }
    }
}

function create_wall_bottom(starty, startx, c, ar) {
    for (var t = 0; t < terPoints.length; ++t) { //This FOR controls width as referenced by the t*10	
        for (var t2 = 0; t2 > -terPoints[t]; t2 -= 10) { //This FOR creates the stack of blocks
            var tempObs = new obstacle(t * 10 + startx, t2 + starty, 10, 10, c);
            push_2dar(tempObs, ar);
        }
    }
    initialize_wall();
}

function create_corner_right(startx, starty, c, ar) {
    //row 1
    for (var i = 0; i < 4; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 2
    for (var i = 0; i < 7; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 10, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 3
    for (var i = 0; i < 9; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 20, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 4
    for (var i = 0; i < 10; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 30, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 5
    for (var i = 0; i < 11; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 40, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 6
    for (var i = 0; i < 12; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 50, 10, 10, c);
        push_2dar(tempObs, ar);
    }//row 7
    for (var i = 0; i < 13; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 60, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 8
    for (var i = 0; i < 13; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 70, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 9
    for (var i = 0; i < 14; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 80, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 10
    for (var i = 0; i < 14; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 90, 10, 10, c);
        push_2dar(tempObs, ar);
    }//row 11
    for (var i = 0; i < 14; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 100, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 12
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 110, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 13
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 120, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 14
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 130, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 15
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * 10 + startx, starty + 140, 10, 10, c);
        push_2dar(tempObs, ar);
    }
}

function create_corner_left(startx, starty, c, ar) {
    //row 1
    for (var i = 0; i < 4; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 2
    for (var i = 0; i < 7; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 10, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 3
    for (var i = 0; i < 9; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 20, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 4
    for (var i = 0; i < 10; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 30, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 5
    for (var i = 0; i < 11; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 40, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 6
    for (var i = 0; i < 12; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 50, 10, 10, c);
        push_2dar(tempObs, ar);
    }//row 7
    for (var i = 0; i < 13; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 60, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 8
    for (var i = 0; i < 13; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 70, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 9
    for (var i = 0; i < 14; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 80, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 10
    for (var i = 0; i < 14; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 90, 10, 10, c);
        push_2dar(tempObs, ar);
    }//row 11
    for (var i = 0; i < 14; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 100, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 12
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 110, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 13
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 120, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 14
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 130, 10, 10, c);
        push_2dar(tempObs, ar);
    }
    //row 15
    for (var i = 0; i < 15; ++i) {
        var tempObs = new obstacle(i * -10 + startx, starty + 140, 10, 10, c);
        push_2dar(tempObs, ar);
    }
}
//END GENERATOR

function initialize_world(worldx, worldy) {
    //Everything under this should be put together separately
    var iter = 300;
    var iterx = 300;
    var itery = 300;
    create_wall_bottom(worldy, worldx + iter * 0, "DeepPink", obstacles3);
    create_wall_bottom(worldy, worldx + iter * 1, "DeepPink", obstacles3);
    create_wall_bottom(worldy, worldx + iter * 2, "DeepPink", obstacles3);
    create_wall_bottom(worldy, worldx + iter * 3, "DeepPink", obstacles3);
    create_wall_left(worldy + iter * 0 + 10, worldx + iter * 4, "DeepPink", obstacles3);
    create_wall_left(worldy + iter * 1 + 10, worldx + iter * 4, "DeepPink", obstacles3);
    create_wall_right(worldy + iter * 0 + 10, worldx - 10, "DeepPink", obstacles3);
    create_wall_right(worldy + iter * 1 + 10, worldx - 10, "DeepPink", obstacles3);
    create_wall_box(worldy + 10, worldx, itery * 2, iterx * 4, "DeepPink", obstacles3);
    create_corner_right(worldx + iter * 4, worldy - (iter / 2) + 10, "DeepPink", obstacles3);
    create_corner_left(worldx - 10, worldy - (iter / 2) + 10, "DeepPink", obstacles3);

    create_wall_bottom(worldy + iter, worldx + iter * 1, "#8A2BE2", obstacles4);
    create_wall_bottom(worldy + iter, worldx + iter * 2, "#8A2BE2", obstacles4);
    create_wall_left(worldy + iter * 1 + 10, worldx + iter * 3, "#8A2BE2", obstacles4);
    create_wall_right(worldy + iter * 1 + 10, worldx + iter - 10, "#8A2BE2", obstacles4);
    create_wall_box(worldy + iter + 10, worldx + iter, itery * 1, iterx * 2, "#8A2BE2", obstacles4);
    create_corner_right(worldx + iter * 3, worldy - (iter / 2) + 10 + iter * 1, "#8A2BE2", obstacles4);
    create_corner_left(worldx + iter - 10, worldy + iter - (iter / 2) + 10, "#8A2BE2", obstacles4);

}

function initializearrays() {
    currents = [];
    starfisharray = [];
    sharkarray = [];
    turtlearray = [];
    //jellyfisharray = [];
};




function start_level(level) {
    player1.health = hwPlayer.health;
    switch (level) {
        case 0:
            break;
        case 1:
            initializearrays();
            //currents
            //tidal
            var currentv11 = new current(900, 900, 100, 300, 5, "up", "#FFFFFF", 50);
            //volcanic
            var currentt11 = new current(0, canvas.height / 2 + 200, WORLD_WIDTH, 300, 2, "left", "#FFFFFF", 50);
            //starfishes
            createStarfish(5);
            //sharks
            var shark11 = new shark(500, 900);
            //turtles
            var turtle11 = new Turtles(500, 600, 40, 40);
            break;
        case 2:
            initializearrays();
            //currents
            var currentv21 = new current(900, 900, 100, 300, 6, "up", "#FFFFFF", 50);
            var currentt21 = new current(0, canvas.height / 2 + 100, WORLD_WIDTH, 600, 1, "right", "#FFFFFF", 50);
            var currentt22 = new current(0, canvas.height / 2 + 700, WORLD_WIDTH, 600, 1, "left", "#FFFFFF", 50);
            //starfishes
            createStarfish(10);
            //sharks
            var shark21 = new shark(500, 900);
            var shark22 = new shark(0, 900);
            //turtles
            var turtle21 = new Turtles(500, 600, 40, 40);
            var turtle22 = new Turtles(1000, 900, 40, 40);
            //jellyfishes
            break;
        case 3:
            initializearrays();
            //currents
            var currentv31 = new current(700, 700, 100, 300, 5, "up", "#FFFFFF", 50);
            var currentt31 = new current(0, canvas.height / 2 + 600, WORLD_WIDTH, 200, 14, "left", "#FFFFFF", 200);
            var currentt32 = new current(0, canvas.height / 2 + 200, WORLD_WIDTH, 1100, 1, "right", "#FFFFFF", 50);
            //starfishes
            createStarfish(20);
            //sharks
            var shark31 = new shark(500, 900);
            var shark32 = new shark(1000, 900);
            var shark33 = new shark(0, 1500);
            //turtles
            var turtle31 = new Turtles(500, 600, 40, 40);
            var turtle32 = new Turtles(1000, 900, 40, 40);
            var turtle33 = new Turtles(800, 1400, 40, 40);
            //jellyfishes
            for (var numJ = 0; numJ < 5; ++numJ) {
                createJellyfish(Math.floor((Math.random() * WORLD_WIDTH)), canvas.height / 2 + Math.floor((Math.random() * (WORLD_HEIGHT - canvas.height / 2))));
            }

            break;
        case 4:
            initializearrays();
            //currents
            //tidal
            var current41 = new current(700, 700, 100, 300, 5, "up", "#FFFFFF", 50);
            //volcanic
            var currentt40 = new current(0, canvas.height / 2, WORLD_WIDTH, 200, 2, "right", "#FFFFFF", 50);
            var currentt41 = new current(0, canvas.height / 2 + 200, WORLD_WIDTH, 300, 6, "right", "#FFFFFF", 200);
            var currentt42 = new current(0, canvas.height / 2 + 500, WORLD_WIDTH, 100, 2, "right", "#FFFFFF", 50);
            var currentt43 = new current(0, canvas.height / 2 + 600, WORLD_WIDTH, 100, 2, "left", "#FFFFFF", 50);
            var currentt44 = new current(0, canvas.height / 2 + 700, WORLD_WIDTH, 300, 6, "left", "#FFFFFF", 200);
            var currentt44 = new current(0, canvas.height / 2 + 1000, WORLD_WIDTH, 300, 2, "left", "#FFFFFF", 50);
            //starfishes
            createStarfish(40);
            //sharks
            var shark41 = new shark(500, 900);
            var shark42 = new shark(1000, 600);
            var shark43 = new shark(0, 900);
            var shark44 = new shark(500, 1400);
            //turtles
            var turtle41 = new Turtles(500, 500, 40, 40);
            var turtle42 = new Turtles(0, 900, 40, 40);
            var turtle43 = new Turtles(1000, 1300, 40, 40);
            //jellyfishes
            for (var numJ = 0; numJ < 10; ++numJ) {
                createJellyfish(Math.floor((Math.random() * WORLD_WIDTH)), canvas.height / 2 + Math.floor((Math.random() * (WORLD_HEIGHT - canvas.height / 2))));
            }
            break;
        case 5:
            initializearrays();
            //currents
            //tidal
            //volcanic
            var current51 = new current(0, canvas.height / 2 + 50, 600, canvas.height, 3, "up", "#FFFFFF", 50);
            var current52 = new current(600, canvas.height / 2 + 50, 600, canvas.height, 3, "down", "#FFFFFF", 50);
            var current53 = new current(1200, canvas.height / 2 + 50, 600, canvas.height, 3, "up", "#FFFFFF", 50);
            var current54 = new current(1800, canvas.height / 2 + 50, 600, canvas.height, 3, "down", "#FFFFFF", 50);
            //starfishes
            createStarfish(80);
            //sharks
            var shark51 = new shark(500, 900);
            //turtles
            var turtle51 = new Turtles(500, 600, 40, 40);
            //jellyfishes
            for (var numJ = 0; numJ < 15; ++numJ) {
                createJellyfish(Math.floor((Math.random() * WORLD_WIDTH)), canvas.height / 2 + Math.floor((Math.random() * (WORLD_HEIGHT - canvas.height / 2))));
            }
            break;

    }
}

//MAIN ELEMENTS
var hwPlayer = playerCreate();
var player1 = new AI(0, 0, hwPlayer);
var worldCamera = new camera();

function start_game() {
    player1.x = WORLD_WIDTH / 2;
    player1.y = 0;
    start_level(LEVEL);
    myInterv = setInterval(loop_game, 60);
    LoadContent(background_links, backgrounds);
    LoadContent(obstacles_textures_links, obstacles_textures);
}

initialize_world(600, 900);
setup();



function update_game() {
    Q_timer--;
    bait_timer--;
    //HAS GAME ENDED?
    if (starfisharray <= 0) {
        ++LEVEL;
        if (LEVEL > 5) {
            screen = 4;
        } else {

            screen = 1; // create handler
        }
        clearInterval(myInterv);
        myInterv = start_menu();

    }
    //Update Backgrounds
    backgrounds_manager(worldCamera);


    //Update Player
    player1.run();


    //Update Camera
    worldCamera.update();
    //Update Starfish
    updateStarfish();
    //Update jellyfish
    //JFG.run(); // jellyfish generator
    updateJellyfish();
    //Update Sharks
    updateSharks();
    //update Turtles
    updateTurtles();
    //Update Currents
    for (i = 0; i < currents.length; i++) {
        currents[i].update();
        currents[i].animateUpdate();
    }
    for (i = 0; i < bait_array.length; i++) {
        bait_array[i].update();
    }
    //Update Fish
    flock.run();

    if (player1.health <= 0 || REEF_HEALTH <= 0) {
        clearInterval(myInterv);
        screen = 5; // create handler
        myInterv = start_menu();
    }

}

function draw_game() {
    //Refresh Screen
    canvas.width = canvas.width;
    //Draw Backgrounds
    drawbackgroundObs(); //Draws background and background elements
    //Draw Reefs
    draw_2dar(obstacles3);
    draw_2dar(obstacles4);
    //Draw Starfish
    drawStarfish();
    //Draw Sharks
    drawSharks();
    //Draw Turtles
    drawTurtles();


    //Draw Player
    player1.draw(); //Draws Player

    //Draw Jellyfish
    drawJellyfish();
    //Draw Current
    for (i = 0; i < currents.length; i++) {
        currents[i].animateDraw();
    }
    //Draw Fish
    flock.draw();
    //Draw Bait
    for (i = 0; i < bait_array.length; i++) {
        bait_array[i].draw();
    }
    //Draw HUD
    context.drawImage(pbar, 10, canvas.height - 140, 200, 200);
    batterybar.draw(player1.health / hwPlayer.health * 133);
    healthbar.draw(REEF_HEALTH / MAX_REEF_HEALTH * 133);
    context.fillStyle = "#8A2BE2";
    context.font = "20px Arial";
    context.fillText(starfisharray.length, healthbar.x + 100, healthbar.y + 95);
}

function loop_game() {
    update_game();
    draw_game();
}
//END MAIN ELEMENTS

//---------------------------------------------------------------------------------------------------
//GLOBALS//
var screen = 0;

var selectAudio = new Audio("https://dl.dropbox.com/s/868fg25aaaplehj/336571__anthousai__coins-05.wav");
var introAudio = new Audio("https://dl.dropbox.com/s/ca8m6rlu6hpobqu/Floating%20Cities.mp3");
var boughtAudio = new Audio("https://dl.dropbox.com/s/eczgb5x0855h0nh/75235__creek23__cha-ching.wav");


function playAudio(clip) {
    clip.play();
}

function pauseAudio(clip) {
    clip.pause();
}


//BEGIN MOUSE INPUT LISTENERS
canvas.addEventListener("mousedown", handledown);
canvas.addEventListener("mouseup", handleup);
canvas.addEventListener("mousemove", handlemove);
var dragging = false;
var selected = 0;
var intx = 0;
var inty = 0;
var any_upgrade = null;

//Start Handledown
function handledown(eventParams) { //eventParams
    if (screen == 1) {
        for (var i = 0; i < upgrades.length; ++i) {
            if (checkBounds(upgrades[i],
                eventParams.clientX + document.documentElement.scrollLeft,
                eventParams.clientY + document.documentElement.scrollTop)) {
                dragging = true;
                intx = eventParams.clientX - upgrades[i].x;
                inty = eventParams.clientY - upgrades[i].y;
                draggingObj = upgrades[i];
                draggingObj.image.src = upgrades[i].image.src;
                selectedUpgrade = null;
                return;
            } else {
                dragging = false;
                draggingObj.is_null = true;
            }
        }
        for (var i = 0; i < attached_assets.length; ++i) {
            if (checkBounds(attached_assets[i],
                eventParams.clientX + document.documentElement.scrollLeft,
                eventParams.clientY + document.documentElement.scrollTop) && attached_assets[i].used) {
                dragging = true;
                intx = eventParams.clientX - attached_assets[i].x;
                inty = eventParams.clientY - attached_assets[i].y;
                any_upgrade = new upgrade(1000 - draggingObj.tempx, draggingObj.tempy, draggingObj.height, draggingObj.width, draggingObj.image.src, draggingObj.border, draggingObj.health, draggingObj.scanner, draggingObj.power, draggingObj.damage);
                draggingObj.x = attached_assets[i].x;
                draggingObj.y = attached_assets[i].y;
                draggingObj.tempx = attached_assets[i].tempx;
                draggingObj.tempy = attached_assets[i].tempy;
                draggingObj.height = attached_assets[i].height;
                draggingObj.width = attached_assets[i].width;
                draggingObj.health = attached_assets[i].health;
                draggingObj.scanner = attached_assets[i].scanner;
                draggingObj.power = attached_assets[i].power;
                draggingObj.damage = attached_assets[i].damage;
                hwPlayer.remove(attached_assets[i]);
                //draggingObj.fillStyle = attached_assets[i].fillStyle;
                draggingObj.image.src = attached_assets[i].image.src;
                draggingObj.border = attached_assets[i].border;
                attached_assets[i].fillStyle = 'rgba(0, 0, 0, 0.5)';
                attached_assets[i].used = false;
                draggingObj.is_null = false;
                selectedUpgrade = null;
                return;
            } else {
                //nothing is selected
                dragging = false;
                draggingObj.is_null = true;
            }
        }
    }
}
//End Handledown

//Begin Handleup
var collided = false;
function handleup(eventParams) {
    if ((dragging == true)) {
        dragging = false;
        if (screen == 1) {
            for (var i = (attached_assets.length - 1) ; i >= 0; --i) {
                if (checkCollusion(draggingObj, attached_assets[i]) && !attached_assets[i].used) {
                    attached_assets[i].used = true;
                    //attached_assets[i].fillStyle = draggingObj.fillStyle;
                    attached_assets[i].image.src = draggingObj.image.src;
                    attached_assets[i].tempx = draggingObj.tempx;
                    attached_assets[i].tempy = draggingObj.tempy;
                    attached_assets[i].health = draggingObj.health;
                    attached_assets[i].scanner = draggingObj.scanner;
                    attached_assets[i].power = draggingObj.power;
                    attached_assets[i].damage = draggingObj.damage;
                    attached_assets[i].border = draggingObj.border;
                    hwPlayer.update(attached_assets[i]);
                    collided = true;
                    neutralizeDragObj();
                    break;
                } else {
                    collided = false;
                }
            }
            if (collided == false) {
                /*
                draggingObj.x = draggingObj.tempx;
                draggingObj.y = draggingObj.tempy;
               */
                any_upgrade = new upgrade(1000 - draggingObj.tempx, draggingObj.tempy, draggingObj.height, draggingObj.width, draggingObj.image.src, draggingObj.border, draggingObj.health, draggingObj.scanner, draggingObj.power, draggingObj.damage);
                neutralizeDragObj();
            }
        }
    }
}
//End Handleup

//Begin Handlemove
function handlemove(eventParams) {

    if (dragging) {
        draggingObj.x = eventParams.clientX - intx;
        draggingObj.y = eventParams.clientY - inty;
    } else if (!dragging && inside_hardware_creation && !collided) {
        draggingObj.x = draggingObj.tempx;
        draggingObj.y = draggingObj.tempy;
    }
}
//End Handlemove

//BEGIN HANDLE CLICKLISTENER
canvas.addEventListener("click", handleclick);
function handleclick(eventParams) {
    if (screen == 0) { // menu screen
        inside_main_menu = false;
        screen = 1;
        inside_hardware_creation = true;
    } else if (screen == 1) { // creation screen
        if (checkBounds(diveWindow, eventParams.clientX, eventParams.clientY)) {
            inside_hardware_creation = false;
            screen = 2;
            selectedUpgrade = null;
            neutralizeDragObj();
            inside_game = true;
        }
        if (hullItemUp.length != 0) {
            if (checkBounds(hullItemUp[0], eventParams.clientX, eventParams.clientY)) {
                selectedUpgrade = hullItemUp[0];
                playAudio(selectAudio);
            }
        }
        if (scanItemUp.length != 0) {
            if (checkBounds(scanItemUp[0], eventParams.clientX, eventParams.clientY)) {
                selectedUpgrade = scanItemUp[0];
                playAudio(selectAudio);
            }
        }
        if (powItemUp.length != 0) {
            if (checkBounds(powItemUp[0], eventParams.clientX, eventParams.clientY)) {
                selectedUpgrade = powItemUp[0];
                playAudio(selectAudio);
            }
        }
        if (wepItemUp.length != 0) {
            if (checkBounds(wepItemUp[0], eventParams.clientX, eventParams.clientY)) {
                selectedUpgrade = wepItemUp[0];
                playAudio(selectAudio);
            }
        }


        if (checkBounds(buyTextWindow, eventParams.clientX, eventParams.clientY) && selectedUpgrade != null && hwPlayer.score >= selectedUpgrade.cost) {
            if (selectedUpgrade.type == 0) {
                if (hullTier == 1) {
                    var hullUpgrade2 = new upgrade(950, 470, 50, 50, imageSrc[8], "hull2", 20, 0, -2, 0);
                    hullTier++;
                } else if (hullTier == 2) {
                    var hullUpgrade3 = new upgrade(895, 415, 50, 50, imageSrc[25], "hull3", 30, 0, -4, 0);
                    hullTier++;
                } else if (hullTier == 3) {
                    var hullUpgrade4 = new upgrade(895, 470, 50, 50, imageSrc[26], "hull4", 40, 0, -6, 0);
                    hullTier++;
                }
                hwPlayer.score -= selectedUpgrade.cost;
                selectedUpgrade = null;
                hullItemUp.splice(0, 1);
                numUpgrades++;
                if (checkNumUpgrades()) {
                    createAttatchment();
                }
            }
            else if (selectedUpgrade.type == 1) {
                if (scannerTier == 1) {
                    var scannerUpgrade2 = new upgrade(700, 475, 50, 50, imageSrc[4], "scan2", 0, 20, 0, 0);
                    scannerTier++;
                } else if (scannerTier == 2) {
                    var scannerUpgrade3 = new upgrade(645, 415, 50, 50, imageSrc[5], "scan3", 0, 30, 0, 0);
                    scannerTier++;
                }
                hwPlayer.score -= selectedUpgrade.cost;
                selectedUpgrade = null;
                scanItemUp.splice(0, 1);
                numUpgrades++;
                if (checkNumUpgrades()) {
                    createAttatchment();
                }
            }
            else if (selectedUpgrade.type == 2) {
                if (powerTier == 1) {
                    var powerUpgrade2 = new upgrade(450, 475, 50, 50, imageSrc[9], "pow2", 0, 0, 4, 0);
                    powerTier++;
                } else if (powerTier == 2) {
                    var powerUpgrade3 = new upgrade(395, 415, 50, 50, imageSrc[10], "pow3", 0, 0, 6, 0);
                    powerTier++;
                } else if (powerTier == 3) {
                    var powerUpgrade4 = new upgrade(395, 475, 50, 50, imageSrc[21], "pow4", 0, 0, 8, 0);
                    powerTier++;
                }
                hwPlayer.score -= selectedUpgrade.cost;
                selectedUpgrade = null;
                powItemUp.splice(0, 1);
                numUpgrades++;
                if (checkNumUpgrades()) {
                    createAttatchment();
                }
            }
            else if (selectedUpgrade.type == 3) {
                if (weaponTier == 1) {
                    //var offenseUpgrade2 = new upgrade(200, 475, 50, 50,imageSrc[2], "off2",0,0,0,20);//poison spear
                    var offenseUpgrade2 = new upgrade(200, 475, 50, 50, imageSrc[23], "off2", 0, 0, 0, 0); // shark rep
                    weaponTier++;
                } else if (weaponTier == 2) {
                    var offenseUpgrade3 = new upgrade(145, 415, 50, 50, imageSrc[22], "off3", 0, 0, 0, 0); //jelly rep
                    weaponTier++;

                }
                /*else if(weaponTier == 3){
                    
                  weaponTier++;
                }else if(weaponTier == 4){
                    var offenseUpgrade5 = new upgrade(90, 415, 50, 50,imageSrc[24], "off5",0,0,0,0);// tag gun
                  weaponTier++;
                }
                */
                hwPlayer.score -= selectedUpgrade.cost;
                selectedUpgrade = null;
                wepItemUp.splice(0, 1);
                numUpgrades++;
                if (checkNumUpgrades()) {
                    createAttatchment();
                }
            }
            playAudio(boughtAudio);
        }
    } else if (screen == 3 && bait_timer < 0 && hwPlayer.bait) { // gameplay screen 
        bait_timer = 75;
        var center_x = player1.x + player1.width / 2,
            center_y = player1.y + player1.height / 2,
            click_localX = eventParams.clientX + worldCamera.topx; // actual X in game world coordinate
        click_localY = eventParams.clientY + worldCamera.topy; // actual Y in game world coordinate
        angle = new PVector(click_localX - center_x, click_localY - center_y); // end - start

        bait_array.push(new Bait(center_x, center_y,
                             20 * Math.cos(angle.heading()), // velocity x
                             20 * Math.sin(angle.heading()), // velocity y
                             -Math.cos(angle.heading()), // accel X, either 1, 0, -1
                             -Math.sin(angle.heading()),// accel X,  either 1, 0, -1
                             100 // life_time
                             )); // velocity y                    
        delete angle;

    }
}
//END HANDLECLICK
//END MOUSE LISTENERS



//Begin CheckBounds 
function checkBounds(image, xpos, ypos) {
    if (xpos < image.x + image.width && ypos < image.y + image.height && xpos > image.x && ypos > image.y) {
        return true;
    }
}
//End CheckBounds

//Begin CheckCollision
function checkCollusion(image1, image2) {
    if ((image1.x + image1.width < image2.x) || (image1.x > image2.x + image2.width) ||
      (image1.y + image1.height < image2.y) || (image1.y > image2.y + image2.height)) {
        return false;
    }
    return true;
}
//End CheckCollision

//SET DRAG OBJ TO NULL
function neutralizeDragObj() {
    draggingObj.x = null;
    draggingObj.y = null;
    draggingObj.height = null;
    draggingObj.width = null;
    draggingObj.fillStyle = null;
    draggingObj.border = null;
    draggingObj.is_null = true;
    draggingObj.health = 0;
    draggingObj.scanner = 0;
    draggingObj.power = 0;
    draggingObj.damage = 0;
}
//END Set To Null

var hullTier = 1;
var scannerTier = 1;
var powerTier = 1;
var weaponTier = 1;
//END GLOBALS



//--------HARDWARE CREATION SCREEN-----------------
//Screen 1
var inside_hardware_creation = false;

var imageSrc = new Array();
imageSrc.push("https://i.imgur.com/gFnMh2j.png?1"); // ship
imageSrc.push("https://i.imgur.com/tLCccDw.png"); // spear gun
imageSrc.push("https://i.imgur.com/HwhFeqT.png"); // poison needle
imageSrc.push("https://i.imgur.com/YbrVC4i.png"); // red small radar
imageSrc.push("https://i.imgur.com/g3tKSNs.png"); // blue med radar
imageSrc.push("https://i.imgur.com/L3cs3SC.png"); // red big radar : 5 - 3rd
imageSrc.push("https://i.imgur.com/IjNazky.png"); // battery
imageSrc.push("https://i.imgur.com/vH8us24.png"); // hull 
imageSrc.push("https://i.imgur.com/486iqKX.png"); // hull + : 8
imageSrc.push("https://i.imgur.com/SKWxKeV.png"); // propulsion 
imageSrc.push("https://i.imgur.com/xQOOpTC.png"); // propulsion + : 10 - 3rd
imageSrc.push("https://i.imgur.com/XpkMfwx.png"); // extension 
imageSrc.push("https://i.imgur.com/j35oU0i.png"); // extension +
imageSrc.push("https://i.imgur.com/eyCSGCr.png"); // new game
imageSrc.push("https://i.imgur.com/TzzIhX9.png"); // instructions
imageSrc.push("https://i.imgur.com/9JygGOT.png"); // Dive Button
imageSrc.push("https://i.imgur.com/u6btJKa.png"); // Upgrade Item Window Template - 16
imageSrc.push("https://i.imgur.com/cCfaxPA.png"); // Name Window Template -17
imageSrc.push("https://i.imgur.com/yXtrcsi.png"); // Property Window Template - 18
imageSrc.push("https://i.imgur.com/PhAsDM4.png"); // Buy Window Template - 19
imageSrc.push("https://i.imgur.com/5VlHIe2.png"); // BUY TEXT - 20
imageSrc.push("https://i.imgur.com/hRDtkdS.png"); // nucelar battery : 21
imageSrc.push("https://i.imgur.com/QSPOIz8.png"); // jelly rep - 22
imageSrc.push("https://i.imgur.com/W9MsqC7.png"); //shark repelant : 23
imageSrc.push("https://i.imgur.com/UdiAnEP.png"); // tag gun : 24
imageSrc.push("https://i.imgur.com/JtOuEar.png"); // hull upgrade +++ : 25
imageSrc.push("https://i.imgur.com/bxWJMi0.png"); // hull upgrade ++++ : 26


//Create Item Upgrades
var hullItemUp = new Array();
var scanItemUp = new Array();
var powItemUp = new Array();
var wepItemUp = new Array();
//types: 0 = Hull, 1 = scanner, 2 = power, 3 = weapons
function itemUpgrade(x, y, h, w, name, cost, src, arr, type, health, scanner, power, damage) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.name = name;
    this.cost = cost;
    this.isBought = false;
    this.image = new Image();
    this.image.src = src;
    this.border = null;
    this.type = type;
    this.health = health;
    this.scanner = scanner;
    this.power = power;
    this.damage = damage;
    arr.push(this);
}
//End item Upgrade

//Create Ship Object
var objects = new Array();
function image(x, y, h, w, src, name) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.image = new Image();
    this.image.src = src;
    this.name = name;
    objects.push(this);
}
image(100, 100, 120, 330, imageSrc[0], "COTSbot");
//End Ship Init

//Create Dragging Object
var tableObj = function (x, y, h, w, src, border, is_null) { //new Array();
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.image = new Image();
    this.image.src = src;
    //this.fillStyle = fillStyle
    this.border = border;
    this.is_null = is_null;
    this.tempx = x;
    this.tempy = y;
    this.health = 0;
    this.scanner = 0;
    this.power = 0;
    this.damage = 0;
};
draggingObj = new tableObj(null, null, null, null, null, null, true);
//End DragObj Init

//Create Upgrades
var upgrades = new Array();
//1000 is screen width
var upgrade = function (x, y, h, w, src, border, health, scan, pow, dam) {
    this.x = 1000 - x;
    this.y = y;
    this.height = h;
    this.width = w;
    //this.fillStyle = fillStyle;
    this.border = border;
    this.tempx = this.x;
    this.tempy = this.y;
    this.image = new Image();
    this.image.src = src;
    this.health = health;
    this.scanner = scan;
    this.power = pow;
    this.damage = dam;
    //this.desc = desc;
    upgrades.push(this);
};
//End Upgr

//Create Ship Attachment Slots
var attached_assets = new Array(); //squares on sub
var attached_asset = function (x, y, h, w, fillStyle, used) {
    this.x = 1000 - x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.tempx;
    this.tempy;
    this.fillStyle = fillStyle;
    this.image = new Image();
    this.image.src = null;
    this.used = used;
    this.health = 0;
    this.scanner = 0;
    this.power = 0;
    this.damage = 0;
    this.border;
    attached_assets.push(this);
};
//End  Attache Slot

//Create Game Windows
var Windows = new Array();
var Window = function (x, y, h, w, name, src) {
    this.x = 1000 - x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.name = name;
    this.image = new Image();
    this.image.src = src;
    Windows.push(this);
};
//End Window



//CREATE PLAYER
function playerCreate() {
    this.score = 0;
    this.health = 100;
    this.scanner = 60;
    this.power = 1;
    this.damage = 5;
    this.bait = false;
    this.q = false;

    this.update = function (Obj) {
        this.health += Obj.health;
        this.scanner += Obj.scanner;
        this.power += Obj.power;
        this.damage += Obj.damage;
    };
    this.remove = function (Obj) {
        this.health -= Obj.health;
        this.scanner -= Obj.scanner;
        this.power -= Obj.power;
        this.damage -= Obj.damage;
    };

    this.items = new Array();
    this.bait = false;
    this.q = false;
    this.itemUpdate = function (items) {
        for (i = 0; i < items.length; i++) {
            if (items[i].border == "off2")
                this.bait = true;
            else if (items[i].border == "off3")
                this.q = true;
        }
    };

    return this;
}

//End Create Player

//Begin Window Create
var botNameWindow = new Window(990, 10, 50, 200, "Bot Name", imageSrc[17]);
var hullListWindow = new Window(970, 360, 200, 200, "Hull", imageSrc[16]);
var scannerWindow = new Window(720, 360, 200, 200, "Scanner", imageSrc[16]);
var powerWindow = new Window(470, 360, 200, 200, "Power", imageSrc[16]);
var weaponWindow = new Window(220, 360, 200, 200, "Utilities", imageSrc[16]);
var upgradeWindow = new Window(270, 20, 300, 250, "UPGRADES", imageSrc[19]);
var diveWindow = new Window(550, 10, 100, 150, "Dive", imageSrc[15]);
var propertyWindow = new Window(970, 80, 260, 220, "Property Window", imageSrc[18]);
var buyTextWindow = new Window(180, 272, 30, 80, "Buy", imageSrc[20]);
//End Window Init

//Begin Item Upgrades
var hullT1 = new itemUpgrade(Windows[5].x + 40, Windows[5].y + 80, 50, 50, "Hull +", 200, imageSrc[8], hullItemUp, 0, 20, 0, -4, 0); // 1st up
var hullT2 = new itemUpgrade(Windows[5].x + 40, Windows[5].y + 80, 50, 50, "Hull ++", 500, imageSrc[25], hullItemUp, 0, 30, 0, -8, 0); // 1st up
var hullT3 = new itemUpgrade(Windows[5].x + 40, Windows[5].y + 80, 50, 50, "Hull +++", 1000, imageSrc[26], hullItemUp, 0, 40, 0, -10, 0); // 1st up

var scanT1 = new itemUpgrade(Windows[5].x + 150, Windows[5].y + 80, 50, 50, "Scan +", 400, imageSrc[4], scanItemUp, 1, 0, 20, 0, 0); // 1st up
var scanT2 = new itemUpgrade(Windows[5].x + 150, Windows[5].y + 80, 50, 50, "Scan ++", 800, imageSrc[5], scanItemUp, 1, 0, 30, 0, 0); // 2nd up

var powerT1 = new itemUpgrade(Windows[5].x + 40, Windows[5].y + 180, 50, 50, "Turbine +", 400, imageSrc[9], powItemUp, 2, 0, 0, 4, 0); // 1st up
var powerT2 = new itemUpgrade(Windows[5].x + 40, Windows[5].y + 180, 50, 50, "Turbine ++", 800, imageSrc[10], powItemUp, 2, 0, 0, 6, 0); // 2nd up
var powerT3 = new itemUpgrade(Windows[5].x + 40, Windows[5].y + 180, 50, 50, "Nuclear Battery", 1200, imageSrc[21], powItemUp, 2, 0, 0, 8, 0); // 2nd up

//var weaponT1 = new itemUpgrade(Windows[5].x + 150, Windows[5].y + 180, 50, 50, "Poison Spear", 50, imageSrc[2],wepItemUp,3); //1st up
var weaponT1 = new itemUpgrade(Windows[5].x + 150, Windows[5].y + 180, 50, 50, "Shark Bait", 300, imageSrc[23], wepItemUp, 3, 0, 0, 0, 0); //3rd up
var weaponT2 = new itemUpgrade(Windows[5].x + 150, Windows[5].y + 180, 50, 50, "Jelly Repellent", 700, imageSrc[22], wepItemUp, 3, 0, 0, 0, 0); //2nd up
//var weaponT4 = new itemUpgrade(Windows[5].x + 150, Windows[5].y + 180, 50, 50, "Tag Gun", 200, imageSrc[24],wepItemUp,3); //4th up
//End Item Upgrades

//CREATE UPGRADES
var scannerUpgrade1 = new upgrade(700, 415, 50, 50, imageSrc[3], "scan1", 0, 15, 0, 0);
var hullUpgrade1 = new upgrade(950, 415, 50, 50, imageSrc[7], "hull1", 10, 0, -2, 0);
var offenseUpgrade1 = new upgrade(200, 415, 50, 50, imageSrc[2], "off1", 0, 0, 0, 5);
var powerUpgrade1 = new upgrade(450, 415, 50, 50, imageSrc[6], "pow1", 0, 0, 2, 0);
//End Upgrade Create

//Create Attactment Windows
var row1Con = new Array();
var row2Con = new Array();
for (i = 0; i < 4; i++) {
    var row1 = new attached_asset(630 - (i * 70), 160, 50, 50, 'rgba(0, 0, 0, 0.5)', false);
    row1Con.push(row1);
}
//END Initial Attacthment Windows

//Select Upgrade in Upgrade Window
var selectedUpgrade = null;
//Number of purchased Upgrades
var numUpgrades = 0;
function checkNumUpgrades() {
    if (numUpgrades != 0 && numUpgrades % 2 == 0) {
        return true;
    }
}

//CREATE ATTATCHMENT SLOTS
function createAttatchment() {
    if (row2Con.length == 0) {
        var row2_1 = new attached_asset(630, 220, 50, 50, 'rgba(0, 0, 0, 0.5)', false);
        row2Con.push(row2_1);
    } else if (row2Con.length == 1) {
        var row2_2 = new attached_asset(560, 220, 50, 50, 'rgba(0, 0, 0, 0.5)', false);
        row2Con.push(row2_2);
    } else if (row2Con.length == 2) {
        var row2_3 = new attached_asset(490, 220, 50, 50, 'rgba(0, 0, 0, 0.5)', false);
        row2Con.push(row2_3);
    } else if (row2Con.length == 3) {
        var row2_4 = new attached_asset(420, 220, 50, 50, 'rgba(0, 0, 0, 0.5)', false);
        row2Con.push(row2_4);
    }
}
//END CREATE ATTATCHMENTS



//HARDWARE CREATION DRAW
function hardwareDraw() {
    canvas.width = canvas.width;
    context.fillStyle = "#9DD1E3"; //9DD1E3//90C3D4//96E2EB//best to worst order
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < Windows.length; i++) {
        context.drawImage(Windows[i].image, Windows[i].x, Windows[i].y, Windows[i].width, Windows[i].height);
    }

    context.fillStyle = "#000000";
    context.font = "18px Verdana";
    context.fillText(Windows[0].name, Windows[0].x + 30, Windows[0].y + 20);
    context.fillText(Windows[1].name, Windows[1].x + 15, Windows[1].y + 25);
    context.fillText(Windows[2].name, Windows[2].x + 8, Windows[2].y + 25);
    context.fillText(Windows[3].name, Windows[3].x + 10, Windows[3].y + 25);
    context.fillText(Windows[4].name, Windows[4].x + 10, Windows[4].y + 25);
    context.fillText(Windows[5].name, Windows[5].x + 60, Windows[5].y + 40);

    context.fillText("Hull", Windows[5].x + 40, Windows[5].y + 70);
    context.fillText("Scanner", Windows[5].x + 140, Windows[5].y + 70);
    context.fillText("Power", Windows[5].x + 40, Windows[5].y + 170);
    context.fillText("Utilities", Windows[5].x + 140, Windows[5].y + 170);

    context.fillText("Health:", Windows[7].x + 20, Windows[7].y + 60);
    context.fillText(hwPlayer.health, Windows[7].x + 95, Windows[7].y + 60);
    context.fillText("Scanner:", Windows[7].x + 20, Windows[7].y + 105);
    context.fillText(hwPlayer.scanner, Windows[7].x + 110, Windows[7].y + 105);
    context.fillText("Power:", Windows[7].x + 20, Windows[7].y + 155);
    context.fillText(hwPlayer.power, Windows[7].x + 95, Windows[7].y + 155);
    context.fillText("Damage:", Windows[7].x + 20, Windows[7].y + 200);
    context.fillText(hwPlayer.damage, Windows[7].x + 110, Windows[7].y + 200);
    context.fillText("Score:", Windows[7].x + 35, Windows[7].y + Windows[7].height - 20);
    context.fillText(hwPlayer.score, Windows[7].x + 100, Windows[7].y + Windows[7].height - 20);
    context.fillText(objects[0].name, Windows[0].x + 30, Windows[0].y + 45);


    context.drawImage(objects[0].image, 340, 150, objects[0].width, objects[0].height);

    //DRAW UPGRADES

    if (selectedUpgrade != null) {
        context.strokeStyle = "#FF0000";
        context.lineWidth = 5; context.strokeRect(selectedUpgrade.x, selectedUpgrade.y, selectedUpgrade.width, selectedUpgrade.height);
        context.fillStyle = "#FF0000";
        //context.font = "20px Verdana";
        context.fillText("(" + selectedUpgrade.health + ")", Windows[7].x + 150, Windows[7].y + 50);
        context.fillText("(" + selectedUpgrade.scanner + ")", Windows[7].x + 150, Windows[7].y + 100);
        context.fillText("(" + selectedUpgrade.power + ")", Windows[7].x + 150, Windows[7].y + 150);
        context.fillText("(" + selectedUpgrade.damage + ")", Windows[7].x + 150, Windows[7].y + 200);
        context.fillText("(-" + selectedUpgrade.cost + ")", Windows[7].x + 135, Windows[7].y + Windows[7].height - 20);
    }

    context.fillStyle = "#000000";
    context.font = "10px Verdana";
    if (hullItemUp.length != 0) {
        context.drawImage(hullItemUp[0].image, hullItemUp[0].x, hullItemUp[0].y, hullItemUp[0].width, hullItemUp[0].height);
        context.fillText(hullItemUp[0].name, hullItemUp[0].x, hullItemUp[0].y + 60);
    }
    if (scanItemUp.length != 0) {
        context.drawImage(scanItemUp[0].image, scanItemUp[0].x, scanItemUp[0].y, scanItemUp[0].width, scanItemUp[0].height);
        context.fillText(scanItemUp[0].name, scanItemUp[0].x, scanItemUp[0].y + 60);
    }
    if (powItemUp.length != 0) {
        context.drawImage(powItemUp[0].image, powItemUp[0].x, powItemUp[0].y, powItemUp[0].width, powItemUp[0].height);
        context.fillText(powItemUp[0].name, powItemUp[0].x, powItemUp[0].y + 60);
    }
    if (wepItemUp.length != 0) {
        context.drawImage(wepItemUp[0].image, wepItemUp[0].x, wepItemUp[0].y, wepItemUp[0].width, wepItemUp[0].height);
        context.fillText(wepItemUp[0].name, wepItemUp[0].x, wepItemUp[0].y + 60);
    }
    //END DRAW UPGRADES



    //DRAW PLAYER ITEMS
    for (i = 0; i < upgrades.length; i++) {
        context.drawImage(upgrades[i].image, upgrades[i].x, upgrades[i].y, upgrades[i].width, upgrades[i].height);
    }
    //END PLAYER ITEMS

    for (i = 0; i < attached_assets.length; i++) {
        if (attached_assets[i].used) {
            context.drawImage(attached_assets[i].image, attached_assets[i].x, attached_assets[i].y, attached_assets[i].width, attached_assets[i].height);
        } else {
            context.fillStyle = attached_assets[i].fillStyle;
            context.fillRect(attached_assets[i].x, attached_assets[i].y, attached_assets[i].width, attached_assets[i].height);
        }
    }

    if (draggingObj.src != null)
        context.drawImage(draggingObj.image, draggingObj.x, draggingObj.y, draggingObj.width, draggingObj.height);

}
//END HARDWARECREATION DRAW
function hardwareUpdate() {
    pauseAudio(introAudio);
    this.itemUpdate(attached_assets);
}



//-------------------MENU SCREEN--------------------
//SCREEN 0
var inside_main_menu = true;

//Create startGame
var option = function (x, y, h, w, t) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.text = t;
};
var newGameButton = new option(430, 300, 25, 125, "New Game");
//End Create

//Draw Menu
function menuDraw() {
    canvas.width = canvas.width;
    //context.drawImage(background, 0, 0);
    context.fillStyle = "#9DD1E3";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";
    context.font = "40px vardana";
    context.fillText("No Hulls Barr", 340, 150);
    context.font = "20px vardana";
    context.fillText(newGameButton.text, newGameButton.x, newGameButton.y);
}

function menuUpdate() {
    playAudio(introAudio);
}
//End Menu Update and Draw



//-------------CALL GAME LOOP--------------
function loop_menu() {
    switch (screen) {
        case 0:
            menuUpdate();
            menuDraw();
            break;
        case 1:
            hardwareUpdate();
            hardwareDraw();
            break;
        case 2:
            clearInterval(myInterv);
            screen = 3;
            start_game();
            break;
        case 4:
            win_draw();
            break;
        case 5:
            lose_draw();
            break;
    }
}

function win_draw() { // l
    canvas.width = canvas.width;
    context.drawImage(WinImage, 0, 0, canvas.width, canvas.height);
}
function lose_draw() {
    canvas.width = canvas.width;
    context.drawImage(LoseImage, 0, 0, canvas.width, canvas.height);
}

var myInterv;

//4 planets in game
function start_menu() {
    clearInterval(myInterv);
    myInterv = setInterval(loop_menu, 60);
}


start_menu();
