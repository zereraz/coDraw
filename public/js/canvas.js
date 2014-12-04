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
    var penSize = parseInt($('#pSize').text());
	var penColor = "#000000";
    var socket = io();
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
			ctx.fillRect(currentX, currentY, penSize,penSize);
			ctx.closePath();
            socket.emit('justClick',{"x":currentX,"y":currentY,"penSize":penSize,"penColor":penColor});
		}else{
			ctx.beginPath();
			ctx.moveTo(prevX, prevY);
			ctx.lineTo(currentX,currentY);
			ctx.lineWidth = penSize;
			ctx.stroke();
			ctx.closePath();
		}
	}

    //
    // Events
    //
    
   
    $('#inc').on('click', incPenSize);
    $('#dec').on('click', decPenSize);
    $('#pColorInp').on('input', penColorChange);

    //
    // Event Handlers
    //
    
    function incPenSize(){
        penSize +=1;
        $('#pSize').text(penSize);
        $('#pColor').css({width:penSize,height:penSize});
    }

    function decPenSize(){
        penSize -=1;
        $('#pSize').text(penSize);
        $('#pColor').css({width:penSize,height:penSize});
    }

    function penColorChange(){
        var penColor = "#"+$('#pColorInp').val();
        $('#pColor').css({background:penColor});
        ctx.strokeStyle = penColor;
        ctx.fillStyle = penColor;
    }

    init();


});


