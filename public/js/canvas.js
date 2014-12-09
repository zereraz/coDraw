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
    var eraser = false;
    //
    // Timers
    //
    // prevT, currT
    //
    var prevT;
    var currT; 

    //
    //keyboard events
    //
    
    $(document).keypress(function(e){
//        console.log("which "+e.which+" keyCode "+e.keyCode+" window "+window.event.keyCode); 
        if(e.which == 61 || e.keyCode == 61 || window.event.keyCode == 61){
            incPenSize()
        }
        if(e.which == 45 || e.keyCode == 45 || window.event.keyCode == 45){
            decPenSize()
        }
    });

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
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
		canvas.addEventListener('mousedown', onMouseDown);
		canvas.addEventListener('mouseup', onMouseUp);
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseout', onMouseOut);
    
    }

    //
	// Drawing functions
	//

	function findxy(e){
	    $('canvas').css({'cursor':'crosshair'});
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
    function drawClick(currentX, currentY, penSize){
            
            ctx.beginPath();
//			ctx.fillRect(currentX-penSize/2, currentY-penSize/2, penSize,penSize);
            pen();
            ctx.fillStyle = penColor; 
            ctx.arc(currentX, currentY,penSize-(penSize/2),0,2*Math.PI,false);
   
            console.log(penColor);
    
            ctx.fill();
            ctx.closePath();
      
    }
    function drawDrag(prevX,prevY,currX,currY,penSize){ 
            ctx.beginPath();
			ctx.moveTo(prevX, prevY);
			ctx.lineTo(currX,currY);
			ctx.lineWidth = penSize;
			ctx.stroke();
			ctx.closePath();
    } 
    function drawStroke(){
		if(!moving){
            drawClick(currentX,currentY,penSize);
            justClickEmit();
		}else{
            drawDrag(prevX,prevY,currentX,currentY,penSize);
            dragDrawEmit();
        }
	}
    function eraserOn(){
        eraser = true;
        penColor = "#123";
        penColorChange();
    }
    function eraserOff(){
        eraser = false;
        pen();
    }
    
    function pen(){
        
        if(!eraser)
             penColor = "#"+$('#pColorInp').val();
        if(penColor.length<=1 && !eraser){
            penColor = "#000000";
        }
    }
    //
    // Sockets Emit Data to server
    //
    function checkType(){

        if(eraser){
            return 'e'; 
        }else{
            return 'p';
        }
    }
	function dragDrawEmit(){
        var type = checkType();
        var dragData = {
                'prevX':prevX,
                'prevY':prevY,
                'currX':currentX,
                'currY':currentY,
                'penColor':penColor,
                'penSize':penSize,
                'type' :type
        };
        socket.emit('dragDraw',dragData);
    }

    function justClickEmit(){
        var type = checkType();
        var clickData = {
                "x":currentX,
                "y":currentY,
                "penSize":penSize,
                "penColor":penColor,
                "type":type
        };
        socket.emit('justClick',  clickData);
    }

    //
    // Events
    //
    
   
    $('#inc').on('click', incPenSize);
    $('#dec').on('click', decPenSize);
    $('#pColorInp').on('input', penColorChange);
    $('#eraser').on('click', eraserOn);
    $('#pen').on('click', eraserOff);
    $('#clearCanvas').on('click', function(){
         ctx.clearRect(0,0,canvas.width,canvas.height); 
    });
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
    function colorChange(color){
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }
    function penColorChange(){
        pen();
        $('#pColor').css({background:penColor});
        console.log(penColor);
        colorChange(penColor);
    }

    init();
    //
    // socket events
    //
    
    socket.on('drawClick', function(data){
        console.log("click "+ data);
        colorChange(data.penColor);
        console.log(data.penColor);
        drawClick(data.x,data.y,data.penSize);
        pen(); 
        colorChange(penColor);
    });

    socket.on('drawDrag',function(data){ 
        colorChange(data.penColor);
        console.log("click "+ data);
        drawDrag(data.prevX,data.prevY,data.currX,data.currY,data.penSize);        
        pen();
        colorChange(penColor);
    });

});

