$('document').ready(function(){

	var canvas;
    var canvasBg;    
    // Context
    var ctx;
    var ctxBg;

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

    // room id
    var myRoom;
    // Flags
    var mouseClick = false;
	var moving = false;
    var isFullScreen = false;
    var penSize = parseInt($('#pSize').text());
	var penColor = "#000000";
    var prevPenColor = "#000000";       
    var bgColor = "#ffffff";
    var eraser = false;
    var text = false;
    var myString = "";
    // undo
    var undo = []; 
    // redo
    var redo = [];

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
       // console.log("which "+e.which+" keyCode "+e.keyCode+" window "+window.event.keyCode); 

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
		canvasBg = document.getElementById('canvasBg');
        ctxBg = canvasBg.getContext('2d'); 
        ctxBg.fillStyle = bgColor;
        ctxBg.fillRect(0,0,canvas.width,canvas.height);
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
            //for mozilla e.offsetX is undefined
            if(e.offsetX!=undefined){
                prevX = e.offsetX;
                prevY = e.offsetY;
            }else{
                prevX= e.pageX-$('#canvas').offset().left;
                prevY= e.pageY-$('#canvas').offset().top;
            }
		}
        //for mozilla e.offsetX is undefined
        if(e.offsetX!=undefined){
            currentX= e.offsetX;
            currentY= e.offsetY;
        }else{
            currentX= e.pageX-$('#canvas').offset().left;
            currentY= e.pageY-$('#canvas').offset().top;
        }
	    
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
		if(!text){

        if(!moving){ 
                drawClick(currentX,currentY,penSize);
                justClickEmit();
            }else{
            drawDrag(prevX,prevY,currentX,currentY,penSize);
            dragDrawEmit();
            }
        }else if(text&&!moving){
                var font = "Georgia";
                ctx.font=penSize+"px "+font; 
                myString = prompt("Enter text");
                if(myString){
                    ctx.fillText(myString,currentX,currentY);
                    var textDetails = {
                        "font":font,
                        "penSize":penSize,
                        "currentX":currentX,
                        "currentY":currentY,
                        "string":myString,
                        "color":penColor,
                        "room":myRoom
                    }
                    socket.emit('text', textDetails);
                } 
        }
    }
    //off eraser text
    function off(){
       eraserOff();
       textOff();
   } 
// In eraser mode
    function eraserOn(){
        off();
        eraser = true;
        prevPenColor = penColor;
        penColor = bgColor; 
        penColorChange();
    }
    
    function eraserOff(){
        eraser = false;
        penColor = prevPenColor;
        penColorChange();
    }
// In text mode
    function textOn(){
        type = 't';
        text = true;    
    } 

    function putText(){
        ctx.font=penSize+"px Georgia";
        myString = prompt("Enter text"); 
        ctx.fillText(myString,currentX,currentY);
    }

    function textOff(){
        myString = "";
        text = false;
    }
    
    function pen(){
        if(!eraser){
             penColor = "#"+$('#pColorInp').val();    
        }else{
            penColor = bgColor; 
        }
        if(penColor.length<=1){
            penColor = "#000000";
        }
    }
    
    function bg(){  
        if(bgColor.length<=1){
            bgColor = "#ffffff";
        }
        removeColor(bgColor);
        bgColor = "#"+$('#bgColorInp').val();    
        if(bgColor.length<=1){
            bgColor = "#ffffff";
        }
        if(eraser){
            eraserOn();
        }else{
            eraserOff();
        }
        ctxBg.fillStyle = bgColor; 
        ctxBg.fillRect(0,0,canvas.width,canvas.height);
    }
    
    
    //Remove this color from canvas
    function removeColor(color){
        var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var pix = imgData.data;
        color = color.slice(1,color.length);
        var newColor = hexToRgb(color); 
        var newBgColor = $('#bgColorInp').val();
        newBgColor = hexToRgb(newBgColor);
        for(var i = 0, n = pix.length;i<n;i += 4){
            var r = pix[i],
                g = pix[i+1],
                b = pix[i+2];
            if(r==newColor.r && g==newColor.g && b==newColor.b){
                /*pix[i] = newBgColor.r;
                pix[i+1] = newBgColor.g;
                pix[i+2] = newBgColor.b;
                */
                pix[i+3] = 0;
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
    
    function hexToRgb(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return {r:r,g:g,b:b};
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
       /* var undoData = {
                'prevX':prevX,
                'prevY':prevY,
                'currX':currentX,
                'currY':currentY,
                'penSize':penSize, 
        };
        undo.push(undoData);
        */
        var dragData = {
                'prevRatioX':prevX/canvas.width,
                'prevRatioY':prevY/canvas.height,
                'currRatioX':currentX/canvas.width,
                'currRatioY':currentY/canvas.height,
                'penColor':penColor,
                'penRatio':penSize/(canvas.width*canvas.height),
                'type' :type,
                "room":myRoom
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
                "type":type,
                "room":myRoom
        };
//        undo.push(clickData);
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
    $('#pColorInp').on('change', penColorChange);
   
    // Input on the color change of background 
    $('#bgColorInp').on('change', bgColorChange);
   
    //Click on text
    $('#textTool').on('click', textOn);

    // Click on eraser
    $('#eraser').on('click', eraserOn);

    // Click on button pen
    $('#pen').on('click',off);

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

    //Download the canvas
    $('#downloadCanvasLink').on('click',function(){
        var name = prompt("Name of image"); 
        this.href = document.getElementById('canvas').toDataURL();
        this.download = name;
    });
    // Undo
/*    $('#undo').on('click',function(){ 
        eraserOn();
        colorChange(bgColor);
        for(var i=0;i<undo.length;i++){     
            drawDrag(undo[i].prevX,undo[i].prevY,undo[i].currX,undo[i].currY,undo[i].penSize+1);
        }
        for(var i=0;i<undo.length;i++){
            undo.shift();
        }

        eraserOff();
    });

    // Redo 
    $('#redo').on('click', redo);
*/
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
    
    // Change the color of pen 
    function penColorChange(){
        pen();
        $('#pColor').css({background:penColor}); 
    }

    // Change the color of background
    function bgColorChange(){
        bg();
        $('#bColor').css({background:bgColor}); 
    }
    // Fullscreen for canvas
    function fullScreen(){
        isFullScreen = true;
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        canvas.width = $(window).width();
        canvas.height = $(window).height();
        canvasBg.width = $(window).width();
        canvasBg.height = $(window).height();
        bg();
        $('#canvas').css('left','0px');
        $('#canvasBg').css('left','0px');
        ctx.putImageData(imageData,0,0); 
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }
    // exit from full screen
    function endFullScreen(){
        $('#canvas').css('left','35%');
        $('#canvasBg').css('left','35%');
        imageData = ctx.getImageData(0,0,$(window).width(),$(window).height()); 
        isFullScreen = false;
        canvas.width = width;
        canvas.height = height; 
        canvasBg.width = width; 
        canvasBg.height = height;
        ctx.putImageData(imageData,0,0);
        bg();  
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }
   /* 
    function undo(){
        eraserOn();
        penColor = bgColor;
        for(var i=0;i<undo.length;i++){
            drawDrag(undo[i].prevX,undo[i].prevY,undo[i].currX,undo[i].currY,undo[i].penSize);
        }
        eraserOff();
    }

    function redo(){

    }
*/
    init();
    
    //
    // socket events
    //
    
    socket.on('error', function(data){
        console.log(data);
    });
    socket.on('myRoom', function(room){
        console.log(room);
        myRoom = room;
    });
    socket.on('textEmit', function(data){
        ctx.font = data.penSize+"px "+data.font;
        colorChange(data.color);        
        console.log(ctx.font);
        ctx.fillText(data.string,data.currentX,data.currentY);
        colorChange(penColor); 
    });     
    socket.on('drawClick', function(data){
        colorChange(data.penColor);
        drawClick(data.x,data.y,data.penSize);
        pen(); 
        colorChange(penColor);
    });

    socket.on('drawDrag',function(data){ 
        console.log(myRoom);
        colorChange(data.penColor);
        drawDragRatio(data.prevRatioX,data.prevRatioY,data.currRatioX,data.currRatioY,data.penRatio);        
        pen();
        colorChange(penColor);
    });

});

