/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function (options) {

    var _this = this;

    this.render = options.render;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* json */
    if (typeof json == 'undefined' && typeof rma != 'undefined') {
        this.json = rma.customize.json;
    } else if (typeof json != 'undefined') {
        this.json = json;
    } else {
        this.json = '';
    }

    /* fet */
    if (typeof fet == 'undefined' && typeof rma != 'undefined') {
        this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function () {
        _this.data = json_data;

        _this.render.render();
    }); 

    /* Get Tracker */
    if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
        this.custTracker = rma.customize.custTracker;
    } else if (typeof custTracker != 'undefined') {
        this.custTracker = custTracker;
    } else {
        this.custTracker = [];
    }

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }
    
    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined' ? rma.customize.src : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function () {

    return new Date().getTime();
}

mads.prototype.tagsProcess = function (tags) {
    
    var tagsStr = '';
    
    for(var obj in tags){
        if(tags.hasOwnProperty(obj)){
            tagsStr+= '&'+obj + '=' + tags[obj];
        }
    }     
    
    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function (url) {

    if(typeof url != "undefined" && url !=""){

        if(typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

        if (typeof mraid !== 'undefined') {
            mraid.open(url);
        }else{
            window.open(url);
        }

        if(typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
    }
}

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

    /*
    * name is used to make sure that particular tracker is tracked for only once
    * there might have the same type in different location, so it will need the name to differentiate them
    */
    name = name || type;

    if ( tt == 'E' && !this.fetTracked ) {
        for ( var i = 0; i < this.fet.length; i++ ) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if ( typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1 ) {
        for (var i = 0; i < this.custTracker.length; i++) {
            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
                src = src.replace('tt={{rmatt}}', '');
            } else {
                src = src.replace('{{rmatt}}', tt);
                this.trackedEngagementType.push(tt);
            }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

mads.prototype.imageTracker = function (url) {
    for ( var i = 0; i < url.length; i++ ) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
}

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function (href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

/*
*
* Unit Testing for mads
*
*/
var coc = function () {
    var self = this;
    /* pass in object for render callback */
    this.app = new mads({
        'render' : this
    });

    self.app.loadCss( self.app.path + 'css/style.css');
    self.render();
    self.canvas = document.getElementById("game");
    this.fps = 30;
    self.touchpic = new Image();
    self.bg = new Image();
    self.towerpic = new Image();
    self.healthpic = new Image();
    self.giantpic = new Image();
    self.arrowpic = new Image();
    this.explodepic = new Image();
    this.blankpic = [
        {
            pic: new Image(),
            x: 1,
            y: 91
        },{
            pic: new Image(),
            x: 108,
            y: 5
        },{
            pic: new Image(),
            x: 236,
            y: 74
        }
    ];
    self.tower = {
        homePos: [{
            x: 14,
            y: 404
        },{
            x: 93,
            y: 404
        },{
            x: 172,
            y: 404
        },{
            x: 249,
            y: 404
        }],
        buildPos:[{
            x: 67,
            y: 250,
            occupied: false
        },{
            x: 67,
            y: 200,
            occupied: false
        },{
            x: 67,
            y: 150,
            occupied: false
        },{
            x: 192,
            y: 250,
            occupied: false
        },{
            x: 192,
            y: 200,
            occupied: false
        },{
            x: 192,
            y: 150,
            occupied: false
        }],
        size: 58,
    };
    self.smallTower = [
        {
            x: 12,
            y: 404,
            built: false,
            onDrag: false,
            homeX: 12,
            homeY: 404
        },{
            x: 91,
            y: 404,
            built: false,
            onDrag: false,
            homeX: 91,
            homeY: 404
        },{
            x: 170,
            y: 404,
            built: false,
            onDrag: false,
            homeX: 170,
            homeY: 404
        },{
            x: 247,
            y: 404,
            built: false,
            onDrag: false,
            homeX: 247,
            homeY: 404
        }
    ];
    self.selectedTower = -1;
    self.mainTower = [
        {
            health: {
                x: 3,
                y: 66,
                value: 100,
                max: 100
            },
            attackPoint: { //attackPoint is the mid point of tower
                x: 39,
                y: 135
            }
        },{
            health: {
                x: 119,
                y: -2,
                value: 100,
                max: 100
            },
            attackPoint: {
                x: 159,
                y: 80
            }
        },{
            health: {
                x: 235,
                y: 66,
                value: 100,
                max: 100
            },
            attackPoint: {
                x: 283,
                y: 135
            }
        }
    ];
    self.timer = {
        value: "00:15",
        color: "#DE2859",
        font: "30px GothamBold",
        x: 4,
        y: 48,
        sec: 15,
        loop: 0
    };
    this.enemies = [];
    this.enemyNo = 0;
    this.projectiles = [];
    this.arrowNo = 0;
    this.dumShooter = [];
    this.spawnPoint = [
        {
            x: 6,
            y: 310
        },{
            x: 126,
            y: 310
        },{
            x: 250,
            y: 310
        }
    ];
    this.spawnTime = {
        min: 3,
        max: 6,
        real: Math.floor((Math.random() * 4) + 3)
    };
    this.onDrag = false;
    this.giantfr = {
        move: [
            {
                x: 0,
                y: 88
            },{
                x: 0,
                y: 176
            }
        ],
        attack: [
            {
                x: 0,
                y: 0,
            },{
                x: 0,
                y: 88
            }
        ]
    };
    this.explosion = [];
    this.explodeNo = 0;
    this.explodefr = [
        {
            x: 0,
            y: 0
        },{
            x: 96,
            y: 0
        },{
            x: 192,
            y: 0
        },{
            x: 288,
            y: 0
        },{
            x: 384,
            y: 0
        },{
            x: 0,
            y: 96
        },{
            x: 96,
            y: 96
        },{
            x: 192,
            y: 96
        },{
            x: 288,
            y: 96
        },{
            x: 384,
            y: 96
        },{
            x: 0,
            y: 192
        },{
            x: 96,
            y: 192
        },{
            x: 192,
            y: 192
        },{
            x: 288,
            y: 192
        },{
            x: 384,
            y: 192
        },{
            x: 0,
            y: 288
        },{
            x: 96,
            y: 288
        },{
            x: 195,
            y: 288
        },{
            x: 288,
            y: 288,
        },{
            x: 384,
            y: 288
        }
    ];
    this.touchX = 0;
    this.touchY = 0;
    this.towerDestroyed = 0;
    this.started = false;
    this.swiper = [];
    self.initGame();
}

/* 
* render function 
* - render has to be done in render function 
* - render will be called once json data loaded
*/
coc.prototype.render = function () { 

    console.log(this.app.data);
    
    this.app.contentTag.innerHTML = 
        '<div class="container">' +
            '<canvas id="game" width="320" height="480">' +
            '</canvas>' + 
            '<button id="download"></button>' +
            '<button id="endnow"></button>' +
            '<div id="endgame">' +
                '<p id="over" class="fade-in">GAME OVER</p>' +
                '<p id="score" class="fade-in">0</p>' +
                '<button id="play" class="fade-in"></button>' +
                '<button id="endDL" class="fade-in"></button>' +
            '<div>' +
        '</div>';

   //this.app.custTracker = ['http://www.tracker2.com?type={{type}}&tt={{tt}}','http://www.tracker.com?type={{type}}'];

}

coc.prototype.initGame = function() {
    var self = this;
    var game = self.canvas;
    var rect = game.getBoundingClientRect();
    var g_ctx = game.getContext("2d");
    var g_bg = new Image();
    var tower = new Image();
    var health = new Image();
    var giant = new Image();
    var arrow = new Image();
    var explode = new Image();
    var blank0pic = new Image();
    var blank1pic = new Image();
    var blank2pic = new Image();
    var touch = new Image();
    var storelink = 'https://itunes.apple.com/us/app/clash-royale/id1053012308?mt=8';
    touch.src = 'img/touch.png';
    g_bg.src = 'img/background COC-2.png';
    tower.src = 'img/tower-2.png';
    health.src = 'img/health.png';
    giant.src = 'img/giant.png';
    arrow.src = 'img/arrow.png';
    explode.src = "img/explosion.png";
    blank0pic.src = "img/blank0.png";
    blank1pic.src = "img/blank1.png";
    blank2pic.src = "img/blank2.png";
    //Check if all images is laoded
    var Pics = [g_bg, tower, health, giant, arrow, explode, blank1pic, blank2pic, touch];
    this.checkImages = function() {
        for (var i = 0; i < Pics.length; i++) {
            if (!Pics[i].complete) {
                setTimeout(function(){
                    self.checkImages();
                }, 50);
                return;
            }
            else{
                self.bg = g_bg;
                self.touchpic = touch;
                self.towerpic = tower;
                self.healthpic = health;
                self.giantpic = giant;
                self.arrowpic = arrow;
                self.explodepic = explode;
                self.blankpic[0].pic = blank0pic;
                self.blankpic[1].pic = blank1pic;
                self.blankpic[2].pic = blank2pic;
                self.time = setInterval(function(){self.update();}, (1000 / self.fps));
                for ( var m in self.mainTower ) {
                    self.dumShooter.push( new self.shooter(self.mainTower[m].attackPoint.x, self.mainTower[m].attackPoint.y));
                }
                self.swiper.push(new self.swipe(self.smallTower[0].homeX + 15, self.smallTower[0].homeY + 15));
                document.getElementById("endnow").addEventListener('click', function() {
                    clearInterval(self.time);
                    self.gameOver();
                });
                return;
            }
        }
    }
    this.checkImages();
    //Prevent double clicking on canvas will accidently highlight html elements
    game.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false); 

    game.addEventListener('mousedown', function(e) {
        self.touchX = e.clientX - rect.left;
        self.touchY = e.clientY - rect.top;
        self.selectTower(self.touchX, self.touchY);
    });

    game.addEventListener('mousemove', function(e) {
        self.touchX = e.clientX - rect.left;
        self.touchY = e.clientY - rect.top;
        self.moveTower(self.touchX, self.touchY);
        
    });
    
    game.addEventListener('mouseup', function(e) {
         self.placeTower();
    });

    game.addEventListener("touchstart", function (e) {
        e.preventDefault();
        self.touchX = e.touches[0].clientX - rect.left;
        self.touchY = e.touches[0].clientY - rect.top;
        self.selectTower(self.touchX, self.touchY);
    });

    game.addEventListener("touchmove", function(e) {
        e.preventDefault();
        self.touchX = e.touches[0].clientX - rect.left;
        self.touchY = e.touches[0].clientY - rect.top;
        self.moveTower(self.touchX, self.touchY);
    });

    game.addEventListener("touchend", function(e) {
        self.placeTower();
    });

    //setup for ios/android
    var iDevices = ["iphone", "ipod", "ipad"];
    var ios = false;
    for ( var i in iDevices ) {
        if ( navigator.userAgent.toLowerCase().indexOf(iDevices[i]) > -1 ) {
            ios = true;
        }
    }
    if ( ios == true ) {
        storelink = "https://itunes.apple.com/us/app/clash-royale/id1053012308?mt=8";
    }
    else {
        storelink = "https://play.google.com/store/apps/details?id=com.supercell.clashroyale&hl=en";
        document.getElementById("endDL").style.backgroundImage = 'url(img/andoid_bttn_big.png)';
        document.getElementById("download").style.backgroundImage = 'url(img/andoid_bttn_small.png)';
    }

    document.getElementById("download").addEventListener('click', function(){
        self.app.linkOpener(storelink);
        self.app.tracker('CTR', 'download');
        console.log('download');
    });

    document.getElementById("endDL").addEventListener('click', function(){
        self.app.linkOpener(storelink);
        self.app.tracker('CTR', 'download');
        console.log('download');
    });
}

coc.prototype.selectTower = function(x, y) {
    var self = gameData;
    for ( var r in self.smallTower) {
        if (self.inArea(x, y, self.smallTower[r].x, self.tower.size,  self.smallTower[r].y, self.tower.size )) {
            if ( self.smallTower[r].built == false ) {
                self.selectedTower = r;
                self.onDrag = true;
            }
            return; //prevent selecting two towers at once
        }
    }
}

coc.prototype.moveTower = function(x, y) {
    var self = gameData;
    if ( self.onDrag == true ) {
        self.smallTower[self.selectedTower].x = self.touchX - self.tower.size / 2;
        self.smallTower[self.selectedTower].y = self.touchY - self.tower.size / 2;
    }
}

coc.prototype.placeTower = function() {
    var self = gameData;
    if ( self.onDrag == true ) {
        var build = false;
        var bp = -1;
        for ( var bt = 0; bt < 6; bt++ ) {
            if (self.inArea(self.touchX, self.touchY, self.tower.buildPos[bt].x, self.tower.size,  self.tower.buildPos[bt].y, self.tower.size )) {
                if (self.tower.buildPos[bt].occupied == false ) {
                    self.tower.buildPos[bt].occupied = true;
                    build = true;
                    bp = bt;
                }
            }
        }
        if ( build == true ) {
            self.started = true;
            self.smallTower[self.selectedTower].x = self.tower.buildPos[bp].x;
            self.smallTower[self.selectedTower].y = self.tower.buildPos[bp].y;
            self.smallTower[self.selectedTower].built = true;
            self.dumShooter.push( new self.shooter(self.smallTower[self.selectedTower].x + 28, self.smallTower[self.selectedTower].y + 28)); //28 is to adjust to mid point of tower (tower.size / 2)
        }
        else {
            self.smallTower[self.selectedTower].x = self.smallTower[self.selectedTower].homeX;
            self.smallTower[self.selectedTower].y = self.smallTower[self.selectedTower].homeY;
        }
    }
    self.onDrag = false;
    self.selectedTower = -1;
}

coc.prototype.inArea = function(ox,oy,ax,aw,ay,ah) {
    if ( ox > ax && oy > ay && ox < ax + aw && oy < ay + ah) {
        return true;
    }
    else{
        return false;
    }
}

coc.prototype.secTomin = function(val) { //compile mm:ss format from total seconds
    var s = val % 60;
    var m = Math.floor(val / 60);
    var v = [m.toString(),s.toString()];
    for (var i in v) {
        if ( v[i].length < 2 ) {
            v[i] = '0' + v[i];
        }
    }
    return v.join(":");
}

coc.prototype.drawRotatedimage = function(image, midX, midY, angle, clipx, clipy,  width, height ) {
    var g_ctx = this.canvas.getContext("2d");
   // save the current co-ordinate system 
    // before we screw with it
    g_ctx.save(); 
 
    // move to the middle of where we want to draw our image
    g_ctx.translate(midX, midY);
 
    // rotate around that point in radians
    g_ctx.rotate(angle);
 
    // draw it up and to the left by half the width
    // and height of the image 
    g_ctx.drawImage(image, clipx, clipy, width, height, -width / 2, -height / 2, width, height);
 
    // and restore the co-ords to how they were when we began
    g_ctx.restore(); 
}

coc.prototype.explode = function(x, y, explodeNo) {
    this.x = x - 36; //because size of explosion pic is 72, so -36 to get its mid point
    this.y = y - 36;
    this.explodeNo = explodeNo;
    this.frameNo = 0;
    this.frameloop = 2;
    this.update = function() {
        if ( this.frameNo < gameData.explodefr.length - 1 ) {
            this.frameloop--
            if ( this.frameloop <=0 ) {
                this.frameloop = 2;
                this.frameNo++;
            }
        }
        else {
            for ( var x in gameData.explosion ) {
                if ( gameData.explosion[x].explodeNo == this.explodeNo) {
                    gameData.explosion.splice(x, 1);
                }
            }
        }
    }
}

coc.prototype.giant = function(x,y,lane, enemyNo) {
    this.x = x; //x of draw image
    this.y = y; //y of draw image
    this.realX = x + 33; //x midpoint of giant
    this.realY = y + 35;//y midpoint of giant
    this.angle = 0;
    this.action = "move";
    this.attackLoop = 10; 
    this.health = 100;
    this.maxHealth = 100;
    this.enemyNo = enemyNo;
    this.frameNo = 0;
    this.moveFrameloop = 5;
    this.target = gameData.mainTower[lane];
    this.update = function() {
        this.x = this.realX - 33; //need to update both x and realX
        this.y = this.realY - 35;
        
        var dist = Math.sqrt((this.target.attackPoint.y - this.realY) * (this.target.attackPoint.y - this.realY) + (this.target.attackPoint.x - this.realX) * (this.target.attackPoint.x - this.realX));
        
        if ( this.health > 0 ) {
            if ( this.target.health.value > 0 ) {
                if ( dist >= 40 ) {
                    if ( this.realY > 135 ) { 
                        this.realY -= 2; //2 is move speed
                    }
                    else {
                        this.angle = Math.atan2((this.target.attackPoint.y - this.realY), (this.target.attackPoint.x - this.realX)) + Math.PI / 2;
                        this.realX += 2 * Math.cos(this.angle - Math.PI / 2); //2 is move speed
                        this.realY += 2 * Math.sin(this.angle - Math.PI / 2);
                    }
                    this.action = "move";
                    this.moveFrameloop--;
                    if ( this.moveFrameloop <= 0 ) {
                        if ( this.frameNo == 0 ) {
                            this.frameNo = 1;
                        }
                        else {
                            this.frameNo = 0;
                        }
                        this.moveFrameloop = 5;
                    }
                }
                else {
                    this.action = "attack";
                    if ( this.attackLoop > 0 ) {
                        this.attackLoop --;
                        if ( this.attackLoop > 5 ) {
                            this.frameNo = 1;
                        }
                        else{
                            this.frameNo = 0;
                        }     
                    }
                    else {
                        this.target.health.value -= 5;
                        this.attackLoop = 45; //fps = 30, so 45 means attack once every 1.5 second
                    }
                }
            }
            else {
                var nearestdist;
                var dumdist = 10000;
                var nextTarg = -1;
                for ( var mt in gameData.mainTower) {
                    if ( gameData.mainTower[mt].health.value > 0 ) {
                        nearestdist = Math.sqrt((gameData.mainTower[mt].attackPoint.x - this.realX) * (gameData.mainTower[mt].attackPoint.x - this.realX) + (gameData.mainTower[mt].attackPoint.y - this.realY) * (gameData.mainTower[mt].attackPoint.y - this.realY));
                        if ( nearestdist <= dumdist ) {
                            dumdist = nearestdist;
                            nextTarg = mt;
                        }
                    }
                }
                if ( nextTarg != -1 ) {
                    this.target = gameData.mainTower[nextTarg];
                }
            }
        }
        else{
            for ( var e in gameData.enemies ) {
                if ( this.enemyNo == gameData.enemies[e].enemyNo ) {
                    gameData.enemies.splice(e, 1);
                    gameData.explosion.push( new gameData.explode(this.realX, this.realY, gameData.explodeNo));
                    gameData.explodeNo++;
                }
            }
        }
    }
}

coc.prototype.shooter = function(x, y) {
    this.x = x;
    this.y = y;
    this.attackLoop = 30;
    this.update = function() {
        if ( this.attackLoop > 0 ) {
            this.attackLoop--;
        }
        else {
            for ( var e = 0; e < gameData.enemies.length; e++ ) {
                if ( gameData.enemies[e].health > 0 ) {
                    var dist = Math.sqrt((gameData.enemies[e].realY - this.y) * (gameData.enemies[e].realY - this.y) + (gameData.enemies[e].realX - this.x) * (gameData.enemies[e].realX - this.x));
                    if ( dist <= 140 ) {
                        gameData.projectiles.push(new gameData.arrow(this.x, this.y, gameData.enemies[e].enemyNo, gameData.arrowNo));
                        gameData.arrowNo++;
                        e = gameData.enemies.length;
                    }
                }
            }
            this.attackLoop = 30;
        }
    }
};

coc.prototype.arrow = function(x, y, enemyNo, arrowNo) {
    this.x = x;
    this.y = y;
    this.realX = x + 5;
    this.realY = y + 1;
    this.enemyNo = enemyNo;
    this.arrowNo = arrowNo;
    this.angle = 0;
    this.update = function() {
        this.x = this.realX - 5;
        this.y = this.realY - 1;
        var found = false;
        for (var e in gameData.enemies ) {
            if ( this.enemyNo == gameData.enemies[e].enemyNo ) {
                found = true;
                if ( gameData.enemies[e].health > 0 ) {
                    var dist = Math.sqrt((gameData.enemies[e].realY - this.realY) * (gameData.enemies[e].realY - this.realY) + (gameData.enemies[e].realX - this.realX) * (gameData.enemies[e].realX - this.realX));
                    this.angle = Math.atan2((gameData.enemies[e].realY - this.realY), (gameData.enemies[e].realX - this.realX)) + Math.PI / 2;
                    if ( dist > 10 ) {
                        this.realX += 15 * Math.cos(this.angle - Math.PI / 2); //15 is move speed
                        this.realY += 15 * Math.sin(this.angle - Math.PI / 2);
                    }
                    else {
                        gameData.enemies[e].health -= 8; //5 is damage
                        this.kill();  
                    }
                }
                else {
                    this.kill();
                }
            }
        }
        if ( found == false ) {
            this.kill();
        }
    };
    this.kill = function() {
        for ( var a in gameData.projectiles ) {
            if ( this.arrowNo == gameData.projectiles[a].arrowNo ) {
                gameData.projectiles.splice(a, 1);
            }
        }
    }
}

coc.prototype.swipe = function(x, y) {
    this.x = x;
    this.y = y;
    this.oriX = x;
    this.oriY = y;
    this.realX = x + 24;
    this.realY = y + 24;
    this.angle = 0;
    this.holdLoop = 30;
    this.stopLoop = 30;
    this.update = function() {
        this.x = this.realX - 24;
        this.y = this.realY - 24;
        var dist = Math.sqrt((gameData.tower.buildPos[1].y + 29 - this.realY) * (gameData.tower.buildPos[1].y + 29 - this.realY) + (gameData.tower.buildPos[1].x + 29 - this.realX) * (gameData.tower.buildPos[1].x + 29 - this.realX));
        this.angle = Math.atan2((gameData.tower.buildPos[1].y + 29 - this.realY), (gameData.tower.buildPos[1].x + 29 - this.realX)) + Math.PI / 2;
        if ( dist > 10 ) {
            this.holdLoop--;
            this.stopLoop = 30;
            if ( this.holdLoop <=0 ) {
                this.realX += 8 * Math.cos(this.angle - Math.PI / 2); //8 is move speed
                this.realY += 8 * Math.sin(this.angle - Math.PI / 2);
            }
        }
        else {
            this.stopLoop--;
            if ( this.stopLoop <= 0 ) {
                this.realX = this.oriX + 24;
                this.holdLoop = 30;
                this.realY = this.oriY + 24;
            }
        }
    }
}

coc.prototype.update = function() {
    var g_ctx = this.canvas.getContext("2d");
    g_ctx.clearRect(0, 0, 320, 480);
    
    //Timer
    if ( this.started == true ) {
        this.timer.loop++;
        if (this.timer.loop >= this.fps) {
            this.timer.sec--;
            this.spawnTime.real--; 
            this.timer.loop = 0;
        }
        this.timer.value = this.secTomin(this.timer.sec);

        //Spawn Enemy
        if (this.spawnTime.real <= 0) {
            this.spawnTime.real = Math.floor((Math.random() * (this.spawnTime.max - this.spawnTime.min + 1)) + this.spawnTime.min);
            var lane = Math.floor((Math.random() * 3));
            if (this.enemies.length < 6) {
                this.enemies.push(new this.giant(this.spawnPoint[lane].x, this.spawnPoint[lane].y, lane, this.enemyNo));
                this.enemyNo++;
            }
        }
    }
    
    //Draw Background
    g_ctx.drawImage(this.bg, 0, 0, 320, 480);
   
    //Update Main Tower
    for (var h in this.mainTower ) {
        if ( this.mainTower[h].health.value > 0 ) {
            g_ctx.drawImage(this.healthpic, this.mainTower[h].health.x, this.mainTower[h].health.y);
            var thx = this.mainTower[h].health.x + 8;
            var thy = this.mainTower[h].health.y + 11;
            var thl = this.mainTower[h].health.value / this.mainTower[h].health.max * 67; //67 is width of health bar
            g_ctx.lineWidth=1;
            g_ctx.strokeStyle="#FF464F";
            g_ctx.beginPath();
            g_ctx.moveTo(thx, thy);
            g_ctx.lineTo(thx + thl, thy);
            g_ctx.lineTo(thx + thl, thy + 8);
            g_ctx.lineTo(thx, thy + 8);
            g_ctx.lineTo(thx, thy);
            g_ctx.stroke();
            g_ctx.fillStyle="#FF464F";
            g_ctx.fill();
        }
        else{
            g_ctx.drawImage(this.blankpic[h].pic, this.blankpic[h].x, this.blankpic[h].y);
            for (s in this.dumShooter ) {
                if ( this.dumShooter[s].x == this.mainTower[h].attackPoint.x ) {
                    this.explosion.push(new this.explode(this.mainTower[h].attackPoint.x, this.mainTower[h].attackPoint.y, this.explodeNo));
                    this.explodeNo++;
                    this.dumShooter.splice(s, 1);
                    this.towerDestroyed++;
                }
            }
        }
    }

    //Draw Time
    g_ctx.fillStyle = this.timer.color;
    g_ctx.font = this.timer.font;
    g_ctx.fillText(this.timer.value, this.timer.x, this.timer.y);

    //Draw small Towers
    for (var r = 0; r < 4; r++) {
        g_ctx.stroke();
        g_ctx.drawImage(this.towerpic, this.smallTower[r].x, this.smallTower[r].y, this.tower.size, this.tower.size);
    }

    //Draw built position
    if ( this.onDrag == true ) {
        g_ctx.globalAlpha = 0.4;
        for (var bt = 0; bt < 6; bt++) {
            g_ctx.drawImage(this.towerpic, this.tower.buildPos[bt].x, this.tower.buildPos[bt].y, this.tower.size, this.tower.size);
        }
        g_ctx.globalAlpha = 1.0;    
    }

    //Update Enemy Actions
    for (var e = 0; e < this.enemies.length; e++ ) {
        this.drawRotatedimage(this.giantpic, this.enemies[e].realX, this.enemies[e].realY, this.enemies[e].angle, this.giantfr[this.enemies[e].action][this.enemies[e].frameNo].x, this.giantfr[this.enemies[e].action][this.enemies[e].frameNo].y, 100, 88);

        //Draw Enemy Health Bar
        var xoffset = 0;
        var yoffset = -10;
        var barLength = 64;
        var barHeight = 8;
        var curx = 4;
        var cury = 3;
        var curyl = barHeight - 2 * cury;
        var hx = this.enemies[e].x + xoffset;
        var hy = this.enemies[e].y + yoffset;
        g_ctx.lineWidth=4;
        g_ctx.strokeStyle="#24429C";
        g_ctx.beginPath();
        g_ctx.moveTo(hx, hy);
        g_ctx.lineTo(hx + barLength, hy);
        g_ctx.quadraticCurveTo(hx + barLength + curx, hy, hx + barLength + curx, hy + cury);
        g_ctx.lineTo(hx + barLength + curx, hy + cury + curyl);
        g_ctx.quadraticCurveTo(hx + barLength + curx, hy + barHeight, hx + barLength, hy + barHeight);
        g_ctx.lineTo(hx, hy + barHeight);
        g_ctx.quadraticCurveTo(hx - curx, hy + barHeight, hx - curx, hy + barHeight - cury);
        g_ctx.lineTo(hx - curx, hy + barHeight - cury - curyl);
        g_ctx.quadraticCurveTo(hx - curx, hy, hx, hy);
        g_ctx.stroke();
        g_ctx.fillStyle="#4D3E3A";
        g_ctx.fill();

        var hl = this.enemies[e].health / this.enemies[e].maxHealth * ( barLength + 6 );
        g_ctx.lineWidth=1;
        g_ctx.strokeStyle="#54D1EF";
        g_ctx.beginPath();
        g_ctx.moveTo(hx - curx + 1, hy + 1);
        g_ctx.lineTo(hx - curx + 1 + hl, hy + 1);
        g_ctx.lineTo(hx - curx + 1 + hl, hy + barHeight - 1);
        g_ctx.lineTo(hx - curx + 1, hy + barHeight - 1);
        g_ctx.lineTo(hx - curx + 1, hy + 1);
        g_ctx.stroke();
        g_ctx.fillStyle="#54D1EF";
        g_ctx.fill();
        this.enemies[e].update();
    }
    
    //Update Shooter
    for (var s in this.dumShooter) {
        this.dumShooter[s].update();
    }

    //Update Arrow
    for (var a in this.projectiles) {
        this.drawRotatedimage(this.arrowpic, this.projectiles[a].x, this.projectiles[a].y, this.projectiles[a].angle, 0, 0, 10, 33);
        this.projectiles[a].update();
    }

    //Update Explosion
    for (var x in this.explosion) {
        g_ctx.drawImage(this.explodepic, this.explodefr[this.explosion[x].frameNo].x, this.explodefr[this.explosion[x].frameNo].y, 96, 96, this.explosion[x].x, this.explosion[x].y, 72, 72);
        this.explosion[x].update();
    }
    
    //Update Swipe animation
    if ( this.started == false ) {
        for ( sw in this.swiper ) {
            this.swiper[sw].update();
            g_ctx.drawImage(this.touchpic, this.swiper[sw].x, this.swiper[sw].y);
        }
    }
    
    //Check game over
    if ( this.timer.sec <= 0 || this.towerDestroyed == 3 ) {
        clearInterval(this.time);
        this.gameOver();
    } 
   
}

coc.prototype.gameOver = function() {
    var score = 0;
    var self = this;
    for ( var m in this.mainTower ) {
        score += this.mainTower[m].health.value;
    }
    document.getElementById("download").style.display = "none";
    setTimeout(function(){
        document.getElementById("endgame").style.display = "block";
    }, 500);
    
    setTimeout(function(){
        document.getElementById("over").style.display = "block";
    }, 1000);

    setTimeout(function(){
        document.getElementById("score").style.display = "block";
        document.getElementById("score").innerHTML = "SCORE: " + score;
    }, 1500);

    setTimeout(function(){
        document.getElementById("play").style.display = "block";
        document.getElementById("play").addEventListener("click", function(){
            document.getElementById("over").style.display = "none";
            document.getElementById("score").style.display = "none";
            document.getElementById("play").style.display = "none";
            document.getElementById("endgame").style.display = "none";
            self.app.tracker('E', 'replay');
            console.log('replay');
            self.tower = {
                homePos: [{
                    x: 14,
                    y: 404
                },{
                    x: 93,
                    y: 404
                },{
                    x: 172,
                    y: 404
                },{
                    x: 249,
                    y: 404
                }],
                buildPos:[{
                    x: 67,
                    y: 250,
                    occupied: false
                },{
                    x: 67,
                    y: 200,
                    occupied: false
                },{
                    x: 67,
                    y: 150,
                    occupied: false
                },{
                    x: 192,
                    y: 250,
                    occupied: false
                },{
                    x: 192,
                    y: 200,
                    occupied: false
                },{
                    x: 192,
                    y: 150,
                    occupied: false
                }],
                size: 58,
            };
            self.smallTower = [
                {
                    x: 12,
                    y: 404,
                    built: false,
                    onDrag: false,
                    homeX: 12,
                    homeY: 404
                },{
                    x: 91,
                    y: 404,
                    built: false,
                    onDrag: false,
                    homeX: 91,
                    homeY: 404
                },{
                    x: 170,
                    y: 404,
                    built: false,
                    onDrag: false,
                    homeX: 170,
                    homeY: 404
                },{
                    x: 247,
                    y: 404,
                    built: false,
                    onDrag: false,
                    homeX: 247,
                    homeY: 404
                }
            ];
            self.mainTower = [
                {
                    health: {
                        x: 3,
                        y: 66,
                        value: 100,
                        max: 100
                    },
                    attackPoint: { //attackPoint is the mid point of tower
                        x: 39,
                        y: 135
                    }
                },{
                    health: {
                        x: 119,
                        y: -2,
                        value: 100,
                        max: 100
                    },
                    attackPoint: {
                        x: 159,
                        y: 80
                    }
                },{
                    health: {
                        x: 235,
                        y: 66,
                        value: 100,
                        max: 100
                    },
                    attackPoint: {
                        x: 283,
                        y: 135
                    }
                }
            ];
            self.timer = {
                value: "00:15",
                color: "#DE2859",
                font: "30px GothamBold",
                x: 4,
                y: 48,
                sec: 15,
                loop: 0
            };
            self.enemies = [];
            self.enemyNo = 0;
            self.projectiles = [];
            self.arrowNo = 0;
            self.dumShooter = [];
            self.onDrag = false;
            self.explosion = [];
            self.explodeNo = 0;
            self.towerDestroyed = 0;
            self.started = false;
            self.swiper[0].realX = self.smallTower[0].oriY + 24;
            self.swiper[0].realY = self.smallTower[0].oriY + 24;
            self.swiper[0].holdLoop = 30;
            self.swiper[0].stopLoop = 30;
            clearInterval(self.time);
            for ( var m in self.mainTower ) {
                self.dumShooter.push( new self.shooter(self.mainTower[m].attackPoint.x, self.mainTower[m].attackPoint.y));
            }
            self.time = setInterval(function(){self.update();}, (1000 / self.fps));
            document.getElementById("download").style.display = "block";
        });
    }, 2000);
    
    setTimeout(function(){
        document.getElementById('endDL').style.display = "block";
    }, 2500);
}

var gameData = new coc();