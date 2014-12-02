
$('document').ready(function(){


	var canvas;
	var ctx;
	var width;
	var height;
	var currentX;
	var currentY;
	var prevX;
	var prevY;
	var mouseClick = false;
	var moving = false;

	//
	// Mouse on events
	//

	function onMouseDown(e){
		findxy(e);
		drawStroke();
		mouseClick = true;
		
	}
	
	function onMouseUp(e){
		findxy(e);
		mouseClick = false;
	}
	
	function onMouseMove(e){
		moving = true;
		if(mouseClick){
			findxy(e);
			drawStroke();
		}	
		moving = false;
	}

	
	function onMouseOut(e){
		moving = false;
		mouseClick = false;
	}

	function init(){
		canvas = document.getElementById('canvas'); 
		ctx = canvas.getContext('2d');
		width = canvas.width;
		height = canvas.height;
		canvas.addEventListener('mousedown', onMouseDown);
		canvas.addEventListener('mouseup', onMouseUp);
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseout', onMouseOut);
	}

	//
	// Drawing functions
	//

	function findxy(e){
		if(mouseClick){
			prevX = currentX;
			prevY = currentY;
		}else{
			prevX = e.offsetX;
			prevY = e.offsetY;
		}
		currentX = e.offsetX;
		currentY = e.offsetY;	
	}
	function drawStroke(){
		if(!moving){
			ctx.beginPath();
			ctx.fillRect(currentX, currentY, 1,1);
			ctx.closePath();
		}else{
			ctx.beginPath();
			ctx.moveTo(prevX, prevY);
			ctx.lineTo(currentX,currentY);
			ctx.lineWidth = 5;
			ctx.stroke();
			ctx.closePath();
		}
	}


	init();
});


