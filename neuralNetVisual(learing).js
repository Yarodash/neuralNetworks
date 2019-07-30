var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var W,H;

function OnResize(e){
	canvas.width = W = window.innerWidth*window.devicePixelRatio;
	canvas.height = H = window.innerHeight*window.devicePixelRatio;
}
window.addEventListener('resize',OnResize);
OnResize();

var min = Math.min;
var max = Math.max;

function activation(x){
	return 1/(1+Math.E**-x);
}

function slope(x){
	return max(x*(1-x),0.001);
}

/*
function activation(x){
	return x;
}

function slope(x){
	return 1;
}
*/
var koef =  0.015;

function randomNumber(length){
	return Math.trunc(Math.random()*length);
}

class node {
	constructor(n){
		this.value = 0;
		this.newError = 0;
		this.error = 0;
		this.weight = [];	
		for (var i = 0; i < n; i++)
			this.weight.push(2*Math.random()-1);
			//this.weight.push(1);
	}
	
	activation(){
		this.value = activation(this.value);
	}
}

class AI {
	constructor(array){
		array.push(0);
		this.net = [];
		for (var i = 0; i < array.length-1; i++) {
			this.net.push([]);
			for (var j = 0; j < array[i]+1; j++)
				this.net[i].push(new node(array[i+1]));
		}
	}
	
	clear(){
		for (var i = 0; i < this.net.length; i++)
			for (var j = 0; j < this.net[i].length; j++) {
				this.net[i][j].value = 0;
				this.net[i][j].error = 0;
			}
		
		for (var i = 0; i < this.net.length; i++)
			this.net[i][this.net[i].length-1].value = 1;
		
	}
	
	get(data){
		this.clear();
		
		for (var i = 0; i < data.length; i++)
			this.net[0][i].value = data[i];
		
		for (var i = 0; i < this.net.length-1; i++)
			for (var j = 0; j < this.net[i].length; j++) {
				//console.log(i,j);
				if (i > 0 && j != this.net[i].length-1) this.net[i][j].activation(); 
				for (var k = 0; k < this.net[i+1].length-1; k++)
					this.net[i+1][k].value += this.net[i][j].value * this.net[i][j].weight[k];
			}
			
		for (var i = 0; i < this.net[this.net.length-1].length; i++)
			this.net[this.net.length-1][i].activation();
			
		//console.log(this.net[this.net.length-1]);
	}
	
	education(data,expect,flag){
		this.get(data);
		
		for (var i = 0; i < expect.length; i++)
			this.net[this.net.length-1][i].error = expect[i] - this.net[this.net.length-1][i].value;
		
		for (var i = this.net.length-2; i >= 0; i--)
			for (var j = 0; j < this.net[i].length-1; j++)
				for (var k = 0; k < this.net[i+1].length-1; k++)
					this.net[i][j].error += this.net[i][j].weight[k] * this.net[i+1][k].error;
				
		//console.log(this.net);
		
		for (var i = 0; i < this.net.length-1; i++)
			for (var j = 0; j < this.net[i].length; j++) {
				//console.log(i,j);
				for (var k = 0; k < this.net[i+1].length-1; k++){
					//console.log(i,j,k,koef, this.net[i+1][k].error, slope(this.net[i+1][k].value), this.net[i][j].value);
					//console.log('result =',this.net[i+1][k].error * slope(this.net[i+1][k].value) * this.net[i][j].value);
					this.net[i][j].weight[k] += koef * this.net[i+1][k].error * slope(this.net[i+1][k].value) * this.net[i][j].value;
				}
			}
	}
}

var test = new AI([2,17,17,17,3]);

var mapX = 500;
var mapY = 500;

function PaintMap(){
	for (var i = 0; i < mapX; i += 5)
		for (var j = 0; j < mapY; j += 5){
			test.get([i/mapX,j/mapX]);
			/*
			if (test.net[2][0].value > 0.5) ctx.fillStyle = 'blue';
			if (test.net[2][0].value < 0.5) ctx.fillStyle = 'red';
			*/
			ctx.fillStyle = 'rgb('+Math.trunc(test.net[test.net.length-1][1].value*255)+','
									+Math.trunc(test.net[test.net.length-1][2].value*255)+','
									+Math.trunc(test.net[test.net.length-1][0].value*255)+')';
			ctx.fillRect(i,j,5,5);
		}
}

class task{
	constructor(x,y,expect,color){
		this.data = [x/mapX,y/mapX];
		this.expect = expect;
		this.color = color;
	}
	
	education(){
		test.education(this.data,this.expect);
	}
	
	draw(){
		ctx.fillStyle = 'white';
		ctx.fillRect(this.data[0]*mapX-4,this.data[1]*mapX-4,9,9);
		if (this.color == 0) ctx.fillStyle = 'blue';
		if (this.color == 1) ctx.fillStyle = 'red';
		if (this.color == 2) ctx.fillStyle = 'green';
		ctx.fillRect(this.data[0]*mapX-3,this.data[1]*mapX-3,7,7);
		//ctx.strokeRect(this.data[0]*mapX-3,this.data[1]*mapX-3,7,7);
	}
}

var TrainingData = [];

function Study(){
	for (var i = 0; i < TrainingData.length; i++)
		TrainingData[i].education();
}

function DrawTask(){
	for (var i = 0; i < TrainingData.length; i++)
		TrainingData[i].draw();
}

var color = 0;
document.addEventListener('click',click);
function click(e){
	if (color == 0)
		TrainingData.push(new task(e.offsetX,e.offsetY,[0.9,0.1,0.1],color));
	if (color == 1)
		TrainingData.push(new task(e.offsetX,e.offsetY,[0.1,0.9,0.1],color));
	if (color == 2)
		TrainingData.push(new task(e.offsetX,e.offsetY,[0.1,0.1,0.9],color));
	DrawTask();
}
document.addEventListener('keydown',function(){color = (color + 1)%3});

function Generation(q){
	for (var i = 0; i < q; i++) Study();
	PaintMap();
	DrawTask();
}

var f = 30;

setInterval(function(){Generation(f)},500)