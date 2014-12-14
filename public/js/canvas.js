$('document').ready(function(){

	var canvas;
    
    // Context
    var ctx;

    // socket object 
    var socket = io();
    // Width of canvas
	var width;
	// Height of canvas
    var height;

    // Current position of mouse
	var currentX;
	var currentY;

    // Previous position of mouse
	var prevX;
	var prevY;

    // ImageData i.e Save
    var imageData;

    // Flags
    var mouseClick = false;
	var moving = false;
    var isFullScreen = false;
    var penSize = parseInt($('#pSize').text());
	var penColor = "#000000";
    var prevPenColor = "#000000";       
    var eraser = false;
 
    //
    // keyboard events
    //
    //
    // + increase size of pen 
    // - decrease size of pen
    //
    // 2 eraser
    // 1 pen
    // 'enter' key to enter fullscreen or escape fullScreen
    
    $(document).keypress(function(e){
        console.log("which "+e.which+" keyCode "+e.keyCode+" window "+window.event.keyCode); 
        
        // + 
        if(e.which == 61 || e.keyCode == 61 || window.event.keyCode == 61){
            incPenSize();
        }
        
        // -     
        if(e.which == 45 || e.keyCode == 45 || window.event.keyCode == 45){
            decPenSize();
        }
        
        // 2
        if(e.which == 50 || e.keyCode == 50 || window.event.keyCode == 50){
            eraserOn();
        }
        
        // 1        
        if(e.which == 49 || e.keyCode == 49 || window.event.keyCode == 49){
            eraserOff();
        }

        // enter 
        if(e.which == 13 || e.keyCode == 13 || window.event.keyCode == 13){
            if(!isFullScreen){
                fullScreen();
            }else{
                endFullScreen();     
            }
            
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
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
		canvas.addEventListener('mousedown', onMouseDown);
		canvas.addEventListener('mouseup', onMouseUp);
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseout', onMouseOut);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
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
            ctx.arc(currentX, currentY,penSize-(penSize/2),0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
      
    }
    
    function drawDragRatio(prevRatioX,prevRatioY,currRatioX,currRatioY,penRatio){      
            ctx.beginPath(); 
            ctx.moveTo(prevRatioX*canvas.width, prevRatioY*canvas.height);
			ctx.lineTo(currRatioX*canvas.width,currRatioY*canvas.height);
			ctx.lineWidth = penRatio*(canvas.width*canvas.height);
			ctx.stroke();
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
        colorChange(penColor);
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
        prevPenColor = penColor;
        penColor = "#123";
        penColorChange();
    }
    
    function eraserOff(){
        eraser = false;
        penColor = prevPenColor;
        penColorChange();
    }
    
    function pen(){
        if(!eraser){
             penColor = "#"+$('#pColorInp').val();
            console.log(penColor);
        }
        if(penColor.length<=1){
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
        /*var dragData = {
                'prevX':prevX,
                'prevY':prevY,
                'currX':currentX,
                'currY':currentY,
                'penColor':penColor,
                'penSize':penSize,
                'type' :type
        };
*/
        var dragData = {
                'prevRatioX':prevX/canvas.width,
                'prevRatioY':prevY/canvas.height,
                'currRatioX':currentX/canvas.width,
                'currRatioY':currentY/canvas.height,
                'penColor':penColor,
                'penRatio':penSize/(canvas.width*canvas.height),
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
    // Events (click , input)
    //
    
   
    // Click on the + button
    $('#inc').on('click', incPenSize);

    // Click on - button
    $('#dec').on('click', decPenSize);

    // Input on the color change of pen 
    $('#pColorInp').on('input', penColorChange);
   
    // Click on eraser
    $('#eraser').on('click', eraserOn);

    // Click on button pen
    $('#pen').on('click', eraserOff);

    // Clear Canvas
    $('#clearCanvas').on('click', function(){
        ctx.clearRect(0,0,canvas.width,canvas.height); 
    });

    // Full Screen
    $('#fullScreen').on('click', function(){
        if(!isFullScreen){
            fullScreen();
        }else{
            endFullScreen();
        }

    });

    $('#downloadCanvasLink').on('click',function(){
        
        this.href = document.getElementById('canvas').toDataURL();
           console.log($(this).href);
        this.download = 'image.png';
    });

    //
    // Event Handlers
    //
    
    // Increase Pen Size 
    function incPenSize(){
        penSize +=1;
        $('#pSize').text(penSize);
        $('#pColor').css({width:penSize,height:penSize});
    }

    // Decrease Pen Size 
    function decPenSize(){
        penSize -=1;
        $('#pSize').text(penSize);
        $('#pColor').css({width:penSize,height:penSize});
    }
    
    // Change Color
    function colorChange(color){
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }
    
    // Change the color 
    function penColorChange(){
        pen(); 
        $('#pColor').css({background:penColor}); 
    }

    // Fullscreen for canvas
    function fullScreen(){
        isFullScreen = true;
        console.log(ctx);
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        canvas.width = $(window).width();
        canvas.height = $(window).height();
        ctx.putImageData(imageData,0,0);
    }
    // exit from full scree
    function endFullScreen(){
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        isFullScreen = false;
        canvas.width = width;
        canvas.height = height; 
        ctx.putImageData(imageData,0,0);
    }

    init();
    
    //
    // socket events
    //
    
    
    socket.on('drawClick', function(data){
        colorChange(data.penColor);
        drawClick(data.x,data.y,data.penSize);
        pen(); 
        colorChange(penColor);
    });

    socket.on('drawDrag',function(data){ 
        colorChange(data.penColor);
        drawDragRatio(data.prevRatioX,data.prevRatioY,data.currRatioX,data.currRatioY,data.penRatio);        
        pen();
        colorChange(penColor);
    });

});

