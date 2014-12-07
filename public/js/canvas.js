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
    // Timers
    //
    // prevT, currT
    //
    var prevT;
    var currT; 
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
    function drawClick(currentX, currentY, penSize){
            ctx.beginPath();
			ctx.fillRect(currentX, currentY, penSize,penSize);
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

    //
    // Sockets Emit Data to server
    //

	function dragDrawEmit(){
        var dragData = {
                'prevX':prevX,
                'prevY':prevY,
                'currX':currentX,
                'currY':currentY,
                'penColor':penColor,
                'penSize':penSize
        };
        socket.emit('dragDraw',dragData);
    }

    function justClickEmit(){
        var clickData = {
                "x":currentX,
                "y":currentY,
                "penSize":penSize,
                "penColor":penColor
        };
        socket.emit('justClick',  clickData);
    }

    //
    // Events
    //
    
   
    $('#inc')
        .on('click', incPenSize);
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
    function colorChange(color){
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }
    function penColorChange(){
        penColor = "#"+$('#pColorInp').val();
        $('#pColor').css({background:penColor});
        clickColor(penColor); 
    }

    init();
    //
    // socket events
    //
    
    socket.on('drawClick', function(data){
        colorChange(data.penColor);
        drawClick(data.x,data.y,data.penSize);
        penColor = "#"+$('#pColorInp').val();
        colorChange(penColor);
    });
    socket.on('drawDrag',function(data){ 

        colorChange(data.penColor);
        drawDrag(data.prevX,data.prevY,data.currX,data.currY,data.penSize);        
        console.log(data.prevX); 
        penColor = "#"+$('#pColorInp').val();
        colorChange(penColor);
    });

});

