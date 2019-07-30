var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var W,H;

function OnResize(e){
	canvas.width = W = window.innerWidth*window.devicePixelRatio;
	canvas.height = H = window.innerHeight*window.devicePixelRatio;
}
window.addEventListener('resize',OnResize);
OnResize();

var koef = 1;

var seed = 0;
function random(){
	seed++;
	return (Math.cos(seed*seed*154)+1)/2
}

function sigmoid(x){
	return 1/(1+Math.E**-x);
}

function randomNumber(length){
	return Math.trunc(Math.random()*length);
}

class connection {
	constructor(n,m){
		this.n = n;
		this.m = m;
		this.weight = (Math.random()-0.5)*koef;
	}
}

class node {
	constructor(){
		this.value = 0;
		this.bias = 0;
		this.connections = [];	
	}
	
	addConnection(n,m){
		this.connections.push(new connection(n,m));
	}
	
	deleteConnection(){
		if (this.connections.length > 0){
			this.connections.splice(randomNumber(this.connections.length),1);
			
			return true
		} else {
			return false
		}
	}
	
	changeConnection(){
		if (this.connections.length > 0){
			this.connections[randomNumber(this.connections.length)].weight += (Math.random()-0.5)*koef;
			
			return true
		} else {
			return false
		}
	}
	
	changeBias(){
		this.bias += (Math.random()-0.5)*koef;
	}
}

class neatAI {
	constructor(inputCount,outputCount){
		this.net = [[],[]];
		for (var i = 0; i < inputCount; i++) this.net[0][i] = new node();
		for (var i = 0; i < outputCount; i++) this.net[1][i] = new node();
	}
	
	clean(){
		for (var i = 0; i < this.net.length; i++)
			for (var j = 0; j < this.net[i].length; j++)
				this.net[i][j].value = this.net[i][j].bias;
	}
	
	get(data){
		this.clean();
		
		for (var i = 0; i < this.net[0].length; i++)
			this.net[0][i].value = data[i];
			
		for (var i = 0; i < this.net.length-1; i++) {			
			for (var j = 0; j < this.net[i].length; j++){
				for (var k = 0; k < this.net[i][j].connections.length; k++) {
				//	console.log(this.net[i][j],this.net[i][j].connections[k].n,this.net[i][j].connections[k].m);
					this.net[this.net[i][j].connections[k].n][this.net[i][j].connections[k].m].value += (this.net[i][j].connections[k].weight)*(this.net[i][j].value);
				}
			}
			
			//for (var j = 0; j < this.net[i+1].length; j++)
				//this.net[i+1][j].value = sigmoid(this.net[i+1][j].value);
		}
		
		var result = [];
		
		for (var i = 0; i < this.net[this.net.length-1].length; i++)
			result.push(this.net[this.net.length-1][i].value);
		
		return result;
	}
	
	createRandomNode(){
		var index = randomNumber(this.net.length-1)+1;
		
		if (index == this.net.length-1 || Math.random() < 0.2) {
			this.net.splice(index,0,[]);
			this.net[index].push(new node());
			for (var i = 0; i < this.net.length; i++)
				for (var j = 0; j < this.net[i].length; j++)
					for (var k = 0; k < this.net[i][j].connections.length; k++)
						this.net[i][j].connections[k].n += this.net[i][j].connections[k].n >= index ? 1 : 0;
		} else {
			this.net[index].push(new node());
		}
	}
	
	deleteRandomNode(){
		if (this.net.length < 3) return;
		
		var index = randomNumber(this.net.length-2)+1;
		var index2 = randomNumber(this.net[index].length);
		
		this.net[index].splice(index2,1);
		
		for (var i = 0; i < index; i++)
			for (var j = 0; j < this.net[i].length; j++)
				for (var k = 0; k < this.net[i][j].connections.length; k++)
					if (this.net[i][j].connections[k].n == index)
						if (this.net[i][j].connections[k].m > index2) this.net[i][j].connections[k].m += 10000;
		
		
		for (var i = 0; i < index; i++)
			for (var j = 0; j < this.net[i].length; j++)
				for (var k = 0; k < this.net[i][j].connections.length; k++)
					if (this.net[i][j].connections[k].n == index)
						if (this.net[i][j].connections[k].m == index2) this.net[i][j].connections.splice(k,0);
					
					
		for (var i = 0; i < index; i++)
			for (var j = 0; j < this.net[i].length; j++)
				for (var k = 0; k < this.net[i][j].connections.length; k++)
					if (this.net[i][j].connections[k].n == index)
						if (this.net[i][j].connections[k].m > index2) this.net[i][j].connections[k].m -= 10001;
					
		if (this.net[index].length == 0) {
			this.net.splice(index,1);
			
			for (var i = 0; i < this.net.length; i++)
				for (var j = 0; j < this.net[i].length; j++)
					for (var k = 0; k < this.net[i][j].connections.length; k++)
						if (this.net[i][j].connections[k].n > index) this.net[i][j].connections[k].n -= 1;
		}
	}
	
	addConnection(){
		var n1,m1,n2 = -1,m2;
		
		n1 = randomNumber(this.net.length-1);
		m1 = randomNumber(this.net[n1].length);
		
		while (n2 <= n1)
			n2 = randomNumber(this.net.length);
		m2 = randomNumber(this.net[n2].length);
		
		//console.log(n1,m1,n2,m2);
		
		var flag = false;
		this.net[n1][m1].connections.forEach(function(x){if (x.n == n2 && x.m == m2) flag = true});
		
		//if (flag) addConnection();
		if (!flag) {
			this.net[n1][m1].addConnection(n2,m2);
		}
	}
	
	deleteConnection(){
		var n1,m1;
		n1 = randomNumber(this.net.length-1);
		m1 = randomNumber(this.net[n1].length);
		this.net[n1][m1].deleteConnection();
	}
	
	changeConnection(){
		var n1,m1;
		n1 = randomNumber(this.net.length-1);
		m1 = randomNumber(this.net[n1].length);
		this.net[n1][m1].changeConnection();
	}
	
	changeBias(){
		var n1,m1;
		n1 = randomNumber(this.net.length-1);
		m1 = randomNumber(this.net[n1].length);
		this.net[n1][m1].changeBias();
	}
	
	mutation(){
		var chance = Math.random()*100;

		if (chance < 10) {
			this.createRandomNode();
		} else if (chance < 40) {
			this.addConnection();
		} else if (chance < 80) {
			this.changeConnection();
		} else if (chance < 100) {
			this.changeBias();
		}/* else if (chance < 98) {
			this.deleteRandomNode();
		} else {
			this.deleteConnection();
		}*/
	}
	
	draw(x,y,w,h){
		ctx.fillRect(x-20,y-20,w+40,h+40);		
		
		for (var i = 0; i < this.net.length; i++)
			for (var j = 0; j < this.net[i].length; j++)
			{
				if (this.net[i][j].value > 0.5) ctx.fillStyle = 'white';
				if (this.net[i][j].value <= 0.5) ctx.fillStyle = 'black';
				ctx.beginPath();
				ctx.arc(i/(this.net.length-1)*w+x,j/(this.net[i].length)*h+y,10,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
			}
		
		for (var i = 0; i < this.net.length; i++)
			for (var j = 0; j < this.net[i].length; j++)
				for (var k = 0; k < this.net[i][j].connections.length; k++) {
					ctx.beginPath();
					ctx.moveTo(i/(this.net.length-1)*w+x,j/(this.net[i].length)*h+y);
					ctx.lineTo(this.net[i][j].connections[k].n/(this.net.length-1)*w+x,this.net[i][j].connections[k].m/(this.net[this.net[i][j].connections[k].n].length)*h+y);
					ctx.stroke();
				}
	}
}
	

const astCount = 25;
const astRadius = 40;	
const playerRadius = 20;
const rotationSpeed = 0.04;
const accelerate = 0.05;
const maxVelocity = 1;
const bulletSpeed = 3;

const fov = Math.PI/4;
const rayCount = 3;
	
class asteroid {
	constructor(x,y,dx,dy,r){
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.r = r;
	}
	
	calculate(){
		this.x += this.dx;
		this.y += this.dy;
		/*
		this.x -= this.x > W ? W : 0;
		this.x += this.x < 0 ? W : 0;
		
		this.y -= this.y > H ? H : 0;
		this.y += this.y < 0 ? H : 0;*/
		
		this.dx *= (this.x < 0 || this.x > W) ? -1 : 1;
		this.dy *= (this.y < 0 || this.y > H) ? -1 : 1;
	}
	
	draw(){
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
		ctx.stroke();
	}
}
	
class bullet {
	constructor(x,y,dx,dy){
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
	}
	
	calculate(){
		this.x += this.dx;
		this.y += this.dy;
	}
	
	draw(){
		ctx.beginPath();
		ctx.arc(this.x,this.y,3,0,2*Math.PI);
		ctx.stroke();
	}
}
	
class player {
	constructor(){
		this.ai = new neatAI(rayCount,3);
		this.restart();
	}
	
	ray(x,y,angle,flag){
		var min = Infinity;
		this.asteroids.forEach(function(ast){
			min = Math.min(Math.sqrt((ast.x-x)**2 + (ast.y-y)**2)-astRadius, min);
		});
		
		min = Math.min(min,x);
		min = Math.min(min,W-x);
		min = Math.min(min,y);
		min = Math.min(min,H-y);
		
		if (flag) {
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(x+Math.cos(angle)*min, y+Math.sin(angle)*min);
			ctx.stroke();
		}
		
		if (min < 10) 
			return 5 
		else if (min > 2000)
			return 2000
		else
			return Math.min(min + this.ray(x+Math.cos(angle)*min, y+Math.sin(angle)*min, angle, flag), 2000);
	}
	
	predict(){
		var data = [];
		
		for (var i = this.angle-fov/2; i <= this.angle+fov/2; i += fov/(rayCount-1)) {
			data.push((this.ray(this.x,this.y,i,false) - playerRadius)/1000);
		}

		/*
		data.push(Math.sqrt(this.dx**2+this.dy**2));
		data.push(this.reload/300);
		
		var angle2 = Math.atan2(this.dy,this.dx);
		
		angle2 -= this.angle;
		while (angle2 < -Math.PI) angle2 += 2*Math.PI;
		while (angle2 >  Math.PI) angle2 -= 2*Math.PI;
		
		data.push(angle2);
		*/
		this.action = this.ai.get(data);
	}
	
	calculate(){		
		this.predict();
		
		this.asteroids.forEach(function(ast){
			ast.calculate();
		});
		
		this.bullets.forEach(function(b){
			b.calculate();
		});
		
		var collision = false;
		
		for (var i = 0; i < this.asteroids.length; i++) {
			for (var j = 0; j < this.bullets.length; j++) 
			if ((this.asteroids[i].x-this.bullets[j].x)**2+(this.asteroids[i].y-this.bullets[j].y)**2<(this.asteroids[i].r)**2){
				collision = true;
				this.asteroids.splice(i,1);
				this.bullets.splice(j,1);
				//this.score += 100;
				break;
			}
			if (collision) break;
		}
		
		this.reload = Math.max(this.reload-1,0)
		
		if (this.action[0] > 0.5) this.angle -= rotationSpeed;
		if (this.action[1] > 0.5) this.angle += rotationSpeed;
		if (this.action[2] > 0.5) {
/*
			var d;
			this.dx += accelerate*Math.cos(this.angle);
			this.dy += accelerate*Math.sin(this.angle);
				
			d = Math.sqrt(this.dx**2 + this.dy**2);
			d = maxVelocity/d;
			
			if (d < 1) {
				this.dx *= d;
				this.dy *= d;
			}*/
			this.dx = maxVelocity*Math.cos(this.angle);
			this.dy = maxVelocity*Math.sin(this.angle);
		}
		if (this.action[3] > 0.5 && this.reload == 0) {
			this.bullets.push(new bullet(this.x,this.y,Math.cos(this.angle)*bulletSpeed,Math.sin(this.angle)*bulletSpeed));
			this.reload = 200;
		}
		
		this.x += this.dx;
		this.y += this.dy;
		
		if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.life = false;
		
		var self = this;
		this.asteroids.forEach(function(ast){
			if ((ast.x-self.x)**2 + (ast.y-self.y)**2 < (astRadius+playerRadius)**2) self.life = false; 
		});
		
		this.score++;		
		
		if (this.score > 1000)
			this.life = false;
	}
	
	play(){		
		this.predict();
		this.calculate();
		
		if (drawing) {
			ctx.fillStyle = 'white';
			ctx.fillRect(0,0,W,H);
			this.draw();
			this.asteroids.forEach(function(ast){ ast.draw() });
			this.bullets.forEach(function(b){ b.draw() });
			
			for (var i = this.angle-fov/2; i <= this.angle+fov/2; i += fov/(rayCount-1))
				this.ray(this.x,this.y,i,true)
			
			this.ai.draw(W-300,H-300,250,250);
		}
	}
	
	restart(){
		this.asteroids = [];
		this.x = W/2;
		this.y = H/2;
		
		this.reload = 0;
		
		var x1,y1;
		
		seed = 0;
		
		for (var i = 0; i < astCount; i++) {
		/*	x1 = Math.random()*W;
			y1 = Math.random()*H;
			while (((this.x-x1)**2+(this.y-y1)**2) < 40000) {
				x1 = Math.random()*W;
				y1 = Math.random()*H;
			}
			
			this.asteroids.push(new asteroid(x1,y1,randomNumber(5)-2,randomNumber(5)-2,astRadius));*/
			
			x1 = random()*W;
			y1 = random()*H;
			while (((this.x-x1)**2+(this.y-y1)**2) < 40000) {
				x1 = random()*W;
				y1 = random()*H;
			}
			
			this.asteroids.push(new asteroid(x1,y1,random()*3-1.5,random()*3-1.5,astRadius));
		}
		
		this.bullets = [];
		
		this.angle = 0;
		this.dx = 0;
		this.dy = 0;
		this.action = [];
		
		this.life = true;
		this.score = 0;
	}
	
	draw(){
		ctx.beginPath();
		ctx.arc(this.x,this.y,playerRadius,0,2*Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x+50*Math.cos(this.angle),this.y+50*Math.sin(this.angle));
		ctx.stroke();
	}
}	

/*
document.addEventListener('keydown',keydown);
function keydown(e){
	if (e.key == "ArrowLeft") myself.action[0] = 1; 
	if (e.key == "ArrowRight") myself.action[1] = 1;
	if (e.key == "ArrowUp") myself.action[2] = 1;
}

document.addEventListener('keyup',keyup);
function keyup(e){
	if (e.key == "ArrowLeft") myself.action[0] = 0; 
	if (e.key == "ArrowRight") myself.action[1] = 0;
	if (e.key == "ArrowUp") myself.action[2] = 0;
}
*/

var botCount = 100;
var randomness = 10;
var bots = [];
for (var i = 0; i < botCount; i++) {
	bots.push(new player());
	//for (var j = 0; j < 100; j++)
		//bots[i].ai.mutation();
	}

var current = 0;

var drawing = false;

var MutateCount = 2;

function Cycle(){
	if (bots[current].life == true) bots[current].play();
	if (bots[current].life == false) {
		current++;
		if (current == botCount) {
			current = 0;
			
			var max = 0, index = 0;
			for (var i = 0; i < botCount; i++)
				if (bots[i].score > max) { max = bots[i].score; index = i; }
			
			console.log(index, max);
			
			for (var i = 0; i < botCount; i++) {
				if (i != index)
					Mutate(index,i,MutateCount);
				bots[i].restart();
			}
			
		}
		
		var t = 0, z = koef;
		koef = 2;
		
		for (var i = 0; i < randomness; i++) {
			while (t == index) t = randomNumber(botCount);
			bots[t] = new player();
			for (var j = 0; j < 15; j++)
				bots[t].ai.mutation();
		}
		koef = z;
	}
}

function Mutate(index,i,q){
	bots[i].ai.net = [];
	for (var j = 0; j < bots[index].ai.net.length; j++){
		bots[i].ai.net.push([]);
		for (var k = 0; k < bots[index].ai.net[j].length; k++) {
			bots[i].ai.net[j].push(new node());
			bots[i].ai.net[j][k].bias = bots[index].ai.net[j][k].bias;
			
			bots[i].ai.net[j][k].connections = [];
			for (var z = 0; z < bots[index].ai.net[j][k].connections.length; z++) {
				bots[i].ai.net[j][k].connections.push(new connection(
					bots[index].ai.net[j][k].connections[z].n,
					bots[index].ai.net[j][k].connections[z].m
				));
				bots[i].ai.net[j][k].connections[z].weight = bots[index].ai.net[j][k].connections[z].weight;
			}
		}
	}
	
	for (var j = 0; j < q; j++) bots[i].ai.mutation();
}

function playdemo(index){
	bots[index].restart();
	drawing = true;
	timer = setInterval(function(){bots[index].play(); if (!bots[index].life) {bots[index].restart(); drawing = false; clearInterval(timer); }},5);
}
