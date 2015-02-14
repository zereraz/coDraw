$('document').ready(function(){

	var canvas;
    var canvasBg;    
    var canvasTemp;
    // Context
    var ctx;
    var ctxBg;
    var ctxTemp;

    // status of room
    var status = {};
    // socket object 
    var socket; 
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

    var type = '';
    // ImageData i.e Save
    var imageData;
    // for enter key to send messages in chat
    var chatEnter = false;
    var inputOptions = false;
    // room id
    var myRoom;
    // Flags
    var mouseClick = false;
	var moving = false;
    var isFullScreen = false;
    var shape = false;
    // to fill shape brushes
    var fill = false;
    var brush = false;
    // circle on click
    var x,y;    
    var px,py;    
    var penSize = parseInt($('#pSize').text());
    var radius = 1;
    //line
    var lpt = []; 
    var rWidth = 1;
    var rHeight = 1;
    var penColor = "#000000";
    var prevPenColor = "#000000";       
    var prevGlobalComposition;
    var bgColor = "#ffffff";
    var currentTool = 'pen';
    var eraser = false;
    var text = false;
    var fontSize = 10;
    var font = "Arial";
    var myString = "";
    // undo
    var undo = []; 
    // redo
    var redo = [];
    var username = 0;

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
            if(e.which == 61 || e.keyCode == 61){
                updatePenSize(penSize+1);
            }
            
            // -     
            if(e.which == 45 || e.keyCode == 45){
                updatePenSize(penSize-1);
            }
            
            // 2
            if((e.which == 50 || e.keyCode == 50) && !inputOptions){
                eraserOn();
            }
            
            // 1        
            if((e.which == 49 || e.keyCode == 49) && !inputOptions){
                off();
                penOn();
            }
            
            // t        
            if(e.which == 116 || e.keyCode == 116){
                textOn();
            }
            
            // c        
            if(e.which == 99 || e.keyCode == 99){
                circleOn();
            }

            // enter 
            if(e.which == 13 || e.keyCode == 13){
                if(!chatEnter){
                    if(!isFullScreen){
                        fullScreen();
                    }else{
                        endFullScreen();     
                    }
                }
            } 
            if(e.which == 114 || e.keyCode == 114){
                rectangleOn();
            }
            if(e.which == 108 || e.keyCode == 108){
                lineOn();
            }
            if(e.which == 98 || e.keyCode == 98){
                brushOn();
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
	    if(type[0] == 'l'){
            lpt.push({'x':currentX,'y':currentY});
            drawLine(lpt[0].x,lpt[0].y,lpt[1].x,lpt[1].y);
            lpt = [];
        } 
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
        socket = io();
        canvas = document.getElementById('canvas'); 
		canvas.width = $(window).height(); 
		canvas.height= $(window).width()*0.35;
        ctx = canvas.getContext('2d');
		canvasBg = document.getElementById('canvasBg');
		canvasBg.width = $(window).height();
		canvasBg.height= $(window).width()*0.35;
        ctxBg = canvasBg.getContext('2d'); 

        // temporary canvas        
        canvasTemp = document.createElement('canvas'); 
        canvasTemp.width = canvas.width;
        canvasTemp.height = canvas.height;
        ctxTemp = canvasTemp.getContext('2d');
        canvasTemp.id = "canvasTemp";
        $(canvasTemp).css('z-index',1);
        var container = canvas.parentNode;
        container.appendChild(canvasTemp);
        //pattern to signify transparency
        drawPattern();
        width = canvas.width;
		height = canvas.height;
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);

        // Event listeners
		canvas.addEventListener('mousedown', onMouseDown);
		canvas.addEventListener('mouseup', onMouseUp);
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseout', onMouseOut);
/*
 *
 *  Fix the reload problem, i.e same form submission again
 *  sent ajax request and get the return value.
 *  If can't refresh value then take back to home page
 *  also if leave page then send disconnect event if possible
 *  apparently that is not happening when user presses leave this 
 *  page then the page closes without any other code working
 */ 
/*
        window.addEventListener("beforeunload", function (e) {
            var confirmationMessage = "sure ?";
            (e || window.event).returnValue = confirmationMessage; //Gecko + IE
            return confirmationMessage;                            //Webkit, Safari, Chrome
        });*/
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        penSize = 1;
        var option = $('#toolOptions');
        option.append("<div id='toolContainer'></div>");
        pencilAdd($('#toolContainer'),'pencil');
    }

    //
	// Drawing functions
	//
    //
    function drawPattern(){

        var imageObj = new Image();
        imageObj.onload = function() {
            var pattern = ctxBg.createPattern(imageObj, 'repeat');

            ctxBg.rect(0, 0, canvasBg.width, canvasBg.height);
            ctxBg.fillStyle = pattern;
            ctxBg.fill();
        };
        imageObj.src = '/img/transp_bg.png';
    
    }
	function findxy(e){
	    $('canvas').css({'cursor':'crosshair'});
        if(mouseClick){
			prevX = currentX;
			prevY = currentY;
		}else{
            //for mozilla e.offsetX is undefined
            if(e.offsetX !== undefined){
                prevX = e.offsetX;
                prevY = e.offsetY;
            }else{
                prevX = e.pageX-$('#canvas').offset().left;
                prevY = e.pageY-$('#canvas').offset().top;
            }
		}
        //for mozilla e.offsetX is undefined
        if(e.offsetX !== undefined){
            currentX = e.offsetX;
            currentY = e.offsetY;
        }else{
            currentX = e.pageX-$('#canvas').offset().left;
            currentY = e.pageY-$('#canvas').offset().top;
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
   // drawing circle 
    function drawCircle(currentX,currentY,radius,fill){
        ctx.beginPath();
        ctx.arc(currentX,currentY,radius,0,Math.PI*2);
        if(fill === 0){
            ctx.stroke();        
        }else{
           ctx.fill();
        }
           
    }
    // on temporary canvas
    function drawCircleTemp(currentX,currentY,radius){
            $(canvasTemp).css('z-index',3);
            ctxTemp.clearRect(0,0,canvasTemp.width,canvasTemp.height);
            ctxTemp.beginPath();
            ctxTemp.arc(currentX,currentY,radius,0,Math.PI*2);
            ctxTemp.stroke();
    }
    // drawing rectangle
    function drawRectangle(currentX, currentY,width,height){
        ctx.beginPath();
        ctx.strokeRect(currentX,currentY,width,height);
        ctx.stroke();
    }
    function clearRectangle (currentX, currentY,width,height){
        ctx.clearRect(currentX,currentY,width,height);
    }
    function clearCircle(x, y, radius){
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.restore(); 
    }
    function drawLine(x1,y1,x2,y2){

        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }



    /*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
     *
     *
     *  Helper functions
     *
     * %%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

    function getSituation(){
    
    }

    function drawStroke(){
        // circle change
        var change;
        var changeX,changeY;
        var sFill = 0;
        colorChange(penColor);
        var situation = getSituation();
        switch(situation){
        
        };
		if(!text && !shape && !brush){
            if(!moving){ 
                    drawClick(currentX,currentY,penSize);
                    justClickEmit();
                }else{
                    drawDrag(prevX,prevY,currentX,currentY,penSize);
                    dragDrawEmit();
                }
            }else if(text && !moving){
                    ctx.font = fontSize+"px "+font; 
                    myString = prompt("Enter text");
                    if(myString){
                        ctx.sFillText(myString,currentX,currentY);
                        var textDetails = {
                            "font":font,
                            "penSize":penSize,
                            "currentX":currentX,
                            "currentY":currentY,
                            "string":myString,
                            "color":penColor,
                            "room":myRoom
                        };
                        socket.emit('text', textDetails);
                    } 
            }else if(shape && !moving || brush && !moving){
                var circleData = {};
                switch(type[0]){
                    //if circle
                    case 'c':

                        x = currentX;
                        y = currentY;
                        drawCircle(x,y,radius,sFill); 
                        circleData = {
                            "type" : 'c',
                            "centerX" : x,
                            "centerY" : y,
                            "radius" :penSize,
                            "color":penColor,
                            "room" : myRoom,
                            "lw":ctx.lineWidth
                        };
                        socket.emit('shape', circleData);
                        break;
                        //if rectangle
                    case 'r':
                        x = currentX;
                        y = currentY;
                        drawRectangle(x,y,rWidth,rHeight);
                        break;
                        //if line
                    case 'l':
                        x = currentX;
                        y = currentY;
                        lpt.push({'x':x,'y':y});
                        if(lpt.length == 2){
                            drawLine(lpt[0].x,lpt[0].y,lpt[1].x,lpt[1].y);
                            lpt = [];
                        } 
                        break;
                        // if brush
                    case 'b':
                        switch(type){
                            case 'bs':
                                drawClick(currentX,currentY,ctx.lineWidth);
                                justClickEmit();
                            break;
                            case 'bf':
                                var img = new Image();
                                img.src = '/img/b_furr.png';
                                x = currentX;
                                y = currentY;
                                ctx.drawImage(img, x, y, ctx.lineWidth, ctx.lineWidth);
                            break;

                                
                    }
                        break;

                }
            }else if(shape && moving || brush && moving){
                switch(type){
                    case 'cco': 
                        change = currentX - prevX;
                        radius += change;
                        updateRadius(radius);
                        if(radius<0){
                            radius = radius*(-1);
                        }
                        drawCircle(currentX,currentY,radius,sFill);

                        var circleData = {
                            "type" : type,
                            "centerX" : currentX,
                            "centerY" : currentY,
                            "color" : penColor,
                            "radius" : radius,
                            "room" : myRoom,
                            "lw":ctx.lineWidth
                        };
                        socket.emit('shape', circleData);
                        break;
                    case 'ct':
                        change = currentX - prevX;
                        radius += change;
                        updateRadius(radius);
                        if(radius<0){
                            radius = radius*(-1);
                        }
                        drawCircle(x,y,radius,sFill);
                        
                        circleData = {
                            "type" : type,
                            "centerX" : x,
                            "centerY" : y,
                            "currentX": currentX,
                            "prevX" : prevX,
                            "color":penColor,
                            "radius" : radius,
                            "room" : myRoom,
                            "lw":ctx.lineWidth
                        };
                        socket.emit('shape', circleData);
                        break;
                    case 'cd':
                        change = currentX - prevX;
                        radius += change;
                        updateRadius(radius);
                        if(radius<0){
                            radius = radius*(-1);
                        }
                        // fix later
                        if(ctx.lineWidth <5){
                            clearCircle(x,y,radius+ctx.lineWidth);
                        }else{
                            clearCircle(x,y,radius+ctx.lineWidth/3);
                        }
                        //drawCircleTemp(x,y,radius);
                        drawCircle(x,y,radius-ctx.lineWidth,sFill);

                        circleData = {
                            "type" : type,
                            "centerX" : x,
                            "centerY" : y,
                            "radius" : radius,
                            "color":penColor,
                            "room" : myRoom,
                            "lw":ctx.lineWidth
                        };
                        //socket.emit('shape', circleData);
                        break;
                    case 'cb':
                        drawCircle(currentX,currentY,radius,sFill);
                        break;
                    // Rectangle cases
                    case 'rd':                        
                        changeX = currentX - prevX;
                        changeY = currentY - prevY; 
                        rWidth += changeX;
                        rHeight += changeY;
                        updateRect();
                        var lw = ctx.lineWidth;
                        changeLineWidth(lw+5);
                        clearRectangle(x-ctx.lineWidth,y-ctx.lineWidth,rWidth+ctx.lineWidth,rHeight+ctx.lineWidth);
                        changeLineWidth(lw);
                        drawRectangle(x,y,rWidth,rHeight);
                        break;
                    case 'rt':                        
                        changeX = currentX - prevX;
                        changeY = currentY - prevY; 
                        rWidth += changeX;
                        rHeight += changeY;
                        updateRect();
                        drawRectangle(x,y,rWidth,rHeight);
                        break;
                    case 'rb':                        
                        drawRectangle(currentX,currentY,rWidth,rHeight);
                        break;
                    case 'ld':
                        if(lpt.length == 1){
                            var temp = ctx.globalCompositeOperation;
                            var lw = ctx.lineWidth;
                            ctx.lineWidth += ctx.lineWidth;
                            ctx.globalCompositeOperation = 'destination-out'; 
                            drawLine(lpt[0].x,lpt[0].y,currentX,currentY); 
                            drawLine(lpt[0].x,lpt[0].y,prevX,prevY); 
                            ctx.globalCompositeOperation = temp; 
                            ctx.lineWidth = lw;
                            drawLine(lpt[0].x,lpt[0].y,currentX,currentY); 
                        } 
                        break;
                    case 'lco':
                        if(lpt.length == 1){
                           drawLine(lpt[0].x,lpt[0].y,currentX,currentY); 
                        }
                        break;
                    case 'bs':
                        drawDrag(prevX,prevY,currentX,currentY,penSize);
                        dragDrawEmit();
                        break;
                    case 'bf':
                        var currP = {x : currentX,y : currentY};
                        var prevP = {x : prevX,y : prevY};
                        var img = new Image();
                        img.src = '/img/b_furr.png';
                        furBrush(currP,prevP,img); 
                        break;
                        var currP = {x : currentX,y : currentY};
                        var prevP = {x : prevX,y : prevY};
                        var img = new Image();
                        img.src = '/img/b_furr.png';
                        furRotateBrush(currP,prevP,img); 
                        break;
                    case 'bvw':
                        var currP = {
                            x:currentX,
                            y:currentY,
                            px:prevX,
                            py:prevY,
                    };
                    variableWidthBrush(currP);
                        break;
                    case 'bsp':                        
                        var currP = {
                            x  : currentX,
                            y  : currentY
                        };
                        sprayBrush(currP);

                }
            }
    }
    function penOn(){
        off();
        updateCurrentTool($(this));
        addToOptions('pencil'); 
    }
    //off eraser text
    function off(){
        changeLineWidth(1);
        eraserOff();
        textOff();
        shapeOff();
        brushOff();
    } 
// In eraser mode
    function eraserOn(){
        off();
        updateCurrentTool($(this));
        addToOptions('eraser');
        eraser = true; 
        prevPenColor = penColor;
        penColor = "rgb(0,0,0,1)"; 
        prevGlobalComposition = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "destination-out";
        penColorChange();
    }
    
    function eraserOff(){
        eraser = false;
        penColor = prevPenColor;
        ctx.globalCompositeOperation = prevGlobalComposition;
        penColorChange();
    }
// Brush mode
    function brushOn(){
        off();
        brush = true;    
        updateCurrentTool($(this));
        addToOptions('brush');
    }
    function brushOff(){
        brush = false;
    }
// In text mode
    function textOn(){
        off();
        type = 't';
        updateCurrentTool($(this));
        text = true;    
    } 
// circle mode on
    function circleOn(){
        off();
        updateCurrentTool($(this));
        addToOptions('circle');
        type = 'cd';
        shape = true;
    }

// Rectangle mode on
    function rectangleOn(){
        off();
        updateCurrentTool($(this));
        addToOptions('rectangle');
        type = 'rd';
        shape = true;
    }
// line mode on
    function lineOn(){
        off();
        updateCurrentTool($(this));
        addToOptions('line');
        type = 'ld';
        shape = true;
    }
// circle mode off
    function shapeOff(){
        $('#toolContainer').remove();
        shape = false;
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

    function changeLineWidth(lineWidth){
        $('#lineW').text('lineWidth : '+lineWidth);
        ctx.lineWidth = lineWidth; 
    }

    function updateCurrentTool(btn,extra){
        // function invoked on click
        if(btn.is("button")){
            currentTool = btn.data("tool");
        }else{
            //function invoked on key press/other uses
            if(extra){
                currentTool = extra;       
            }
        } 
    }

    // Refactor all html to different variables and just add them

    function lineWidthAdd(optionDiv,caller){
        // Linewidth change
        var tool = '<div class="tool"><p id="lineW">lineWidth : 1</p><input id="lineWidth" min="1" max="50" type="range"step="1" value="1"><p>tool : '+caller+'</div>'; 
        optionDiv.append(tool); 
        var lineWidth = 1;
        $('#lineW').text('lineWidth : '+lineWidth);
        
        $('#lineWidth').on('change input',function(){
            lineWidth = $(this).val();
            changeLineWidth(lineWidth);
        });
    }
        
    function pencilAdd(optionDiv,caller){
        var tool = '<div class="tool"><p id="pSize">pensize : 1</p><input id="penSize" min="1" max="200" type="range"step="1"value="1"><p>tool : pencil</p></div>';               
        optionDiv.append(tool);
        $('#penSize').on('change input',function(){
            updatePenSize($(this).val());
        });
    }
     function eraserAdd(optionDiv,caller){
        var tool = '<div class="tool"><p id="pSize">eraser size : 1</p><input id="penSize" min="1" max="200" type="range"step="1"value="1"><p>tool : eraser</p></div>';               
        optionDiv.append(tool);
        $('#penSize').on('change input',function(){
            updatePenSize($(this).val());
        });
    }
    function circleAdd(optionDiv,caller){ 

        var tool = "<div class='tool'><p id='rSize'>radius : 1</p><input id='radius' min='1' max='300' type='range'step='1'value='1'><select id="+caller+"><option>default</option><option>cone</option><option>target</option><option>brush</option></select><input id='connected' type='checkbox' value='false' />fill</div>";
                optionDiv.append(tool);
                lineWidthAdd(optionDiv,caller);
                $('#radius').on('change input',function(){
                    updateRadius($(this).val());
                });
                $('#'+caller).on('change input',function(){
                    var selected = $(this).val();
                    switch(selected){
                        case "cone":
                            type = 'cco';
                            break;
                        case "default":
                            type = 'cd';
                            break;
                        case "target":
                            type = 'ct';
                            break;
                        case "brush":
                            type = 'cb';
                            break;

                    }
                });
                $('#connected').on('change', function(){
                    if($(this).val() === 'false'){
                        $(this).attr('value','true');
                        fill
                    }else{                        
                        $(this).attr('value','false');
                    }

                });
    }
    function lineAdd(optionDiv,caller){

          var tool = "<div class='tool'><p>tool : line</p><select id="+caller+"><option>default</option><option>lineCone</option></select><input id='connected' type='checkbox' value='false' />Connected</div>";
                optionDiv.append(tool);
                lineWidthAdd(optionDiv,caller);
                $('#'+caller).on('change',function(){
                    var selected = $(this).val();
                    switch(selected){
                        case "lineCone":
                            type = 'lco';
                            break;
                        case "default":
                            type = 'ld';
                            break;

                    }
                });
                $('#connected').on('change', function(){
                    if($(this).val() === 'false'){
                        $(this).attr('value','true');
                    }else{                        
                        $(this).attr('value','false');
                    }

                });
    }
    // Refactor, create a function that creates an input range
    // with all the given parameters. more generic
    // also make an event add function
    function rectangleAdd(optionDiv,caller){
     
        var tool = "<div class='tool'><p id='wi'>width : 1</p><input id='width' min='1' max='300' type='range'step='1'value='1'><p id='hi'>height : 1</p><input id='height' min='1' max='300' type='range'step='1'value='1'><select id="+caller+"><option>default</option><option>rectTarget</option><option>brush</option></select></div>";

        optionDiv.append(tool);
        lineWidthAdd(optionDiv,caller);
        $('#width').on('change input',function(){
            rWidth = parseInt($(this).val());
            updateRect();
        });

        $('#height').on('change input',function(){
            rHeight = parseInt($(this).val());
            updateRect();
        });

        $('#'+caller).on('change',function(){
            var selected = $(this).val();
            switch(selected){
                case "default":
                    type = 'rd';
                break;
                case "rectTarget":
                    type = 'rt';
                break;
                case 'brush':
                    type = 'rb';
                break;

            }
        });
    }

    function brushAdd(optionDiv, caller){
        var tool = "<div class='tool'><select id="+caller+"><option>simple</option><option>fur</option><option>rotating fur</option><option>variable width</option></select></div>";
        optionDiv.append(tool);
        lineWidthAdd(optionDiv,caller);
        type = 'bs';
        $('#'+caller).on('change',function(){
            var selected = $(this).val();
            switch(selected){
                case "simple":
                    type = 'bs';
                break;
                case "fur":
                    type = 'bf';
                break;
                case "rotating fur":
                    type = 'brf';
                    break;
                case "variable width":
                    type = 'bvw';
                    break;
            }
        })
    }
    
    // Text ADD
    // font,size



   function addToOptions(caller){
        var option = $('#toolOptions');
        option.append("<div id='toolContainer'></div>");
        var optionDiv = $('#toolContainer');
        var tool;
        switch(caller){
            case "pencil":
                pencilAdd(optionDiv,caller);
                break;
            case "circle":
                circleAdd(optionDiv,caller);
                break;

            case "rectangle":
                rectangleAdd(optionDiv,caller);
                break;
            case "line":
                lineAdd(optionDiv,caller); 
                break;
            case "brush":
                brushAdd(optionDiv,caller);
                break;
            case "text":
                textAdd(optionDiv,caller);
                break;
            case "eraser":
                eraserAdd(optionDiv, caller);

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
	
    function downloadImage(name,link){
        ctxTemp.drawImage(canvasBg,0,0);
        ctxTemp.drawImage(canvas,0,0);
        link.href = canvasTemp.toDataURL();
        link.download = name;
    }

    function dragDrawEmit(){
        type = checkType();
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
    
   

    // Input on the color change of pen 
    $('#pColorInp').on('change', penColorChange);
   
    // Input on the color change of background 
    $('#bgColorInp').on('change', bgColorChange);

    // Click on Circle tool
    $('#circleTool').on('click',circleOn);

    // Click on rectangle tool
    $('#rectangleTool').on('click',rectangleOn);

    // Click on line tool
    $('#lineTool').on('click',lineOn);

    // Click on text
    $('#textTool').on('click', textOn);

    // Click on eraser
    $('#eraser').on('click', eraserOn);

    // Click on button pen
    $('#pen').on('click', penOn);

    // click on Brush
    $('#brushTool').on('click',brushOn);
    // Clear Canvas
    $('#clearCanvas').on('click', function(){
        ctx.clearRect(0,0,canvas.width,canvas.height); 
    });

    // Opacity
    $('#opacity').on('change',function(){
        $('#opacityVal').text('opacity '+$(this).val());
        ctx.globalAlpha = $(this).val();
    });

    $('#lineWidth').on('focusin',function(){
        inputOptions = true;
    });

    $('#lineWidth').on('focusout',function(){
        inputOptions = false; 
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
        if(name===null){
            return false;
        }
        ctxTemp.drawImage(canvasBg,0,0);
        ctxTemp.drawImage(canvas,0,0);
        this.href = canvasTemp.toDataURL();
        this.download = name;
//        downloadImage(name,$(this));
    });


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 %
 %
 %  Chat Part
 %
 %
 %
 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/


//
// Click send
//

    $('#messageForm').on('submit',function(){
        var message = $('#reply').val(); 
        if(username!==0){
            if(message.length>0){
               $('#messages').append('<li class="mySent">'+message+'<hr></li>');
                var chatData = {
                    'message':message,
                    'room':myRoom,
                    'user':username
                };
                socket.emit('messageSent',chatData);
                var height = 0;
                $('#messages li').each(function(i, value){
                    height += parseInt($(this).height());
                });

                height += ''; 
                $('#chatWindow').animate({scrollTop:height},0);
                $('#reply').val('');
            }
        }else{
            $('.error').html('<p>username not defined</p>');
        }
        chatEnter = true;
        return false;
    });
    $('#reply').focusin(function(){
        chatEnter = true;
    });
    $('#reply').focusout(function(){
        chatEnter = false;
    });
    $('#username').focusin(function(){
        chatEnter = true;
    });
    $('#sendUser').submit(function(){
        username = $('#username').val();
        if(username.length>0){
            $(this).remove();
            $('#replyWindow').css('display','inherit');
            chatEnter = false;
        }else{
            $('.error').html('<p> no username added</p>');
        }
        return false;
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
    
    // Update Pen Size 
    function updatePenSize(size){
        size = parseInt(size);
        if(size>1){
            penSize  = size;
            $('#pSize').text('pensize : '+penSize);
            $('#penSize').val(penSize);
            $('#pColor').css({width:penSize,height:penSize});
        }
    }

    function updateRadius(r){
        r = parseInt(r);
        if(r>0){
            radius = r;
            $('#radius').val(r);
            $('#rSize').text('radius : '+ r);
            $('#pColor').css({width: r,height: r});
        }
    }
    
    function updateRect(){
        if(rWidth>0){
            $('#width').val(rWidth);
            $('#wi').text('width : '+rWidth);
        }
        if(rHeight>0){
            $('#height').val(rHeight);
            $('#hi').text('height : '+rHeight);
        }
    }

    function updateLineWidth(){
        
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
        collapseAll();
        $('#status').css('display','none'); 
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
        expandAll();
        $('#status').css('display','inline');
        $('#canvas').css('left','15%');
        $('#canvasBg').css('left','15%');
        imageData = ctx.getImageData(0,0,$(window).width(),$(window).height());
        var ratioX = $(window).width()/width;
        var ratioY = $(window).height()/height;
        isFullScreen = false;
        //canvas back to original size
        canvas.width = width;
        canvas.height = height;
        //background back to original size
        canvasBg.width = width;
        canvasBg.height = height;
        //ctx.scale(1/ratioX,1/ratioY);
        ctx.putImageData(imageData,0,0);
        bg();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }

    function updateStatus(myStatus){
        myRoom = myStatus.room;
        status = myStatus;
        $('#status').html('<h3>room : '+status.room+'</h3><h3> username : '+status.username+'</h3><h3> id : '+status.id+'</h3><h3>total user : '+status.users);
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


    // on error    
    socket.on('error', function(data){
        console.log(data);
    });

    // room sent to client 
    socket.on('myRoom', function(room){ 
        myRoom = room;
    });

    // text sent to client
    socket.on('textEmit', function(data){
        ctx.font = data.penSize+"px "+data.font;
        colorChange(data.color);
        ctx.fillText(data.string,data.currentX,data.currentY);
        colorChange(penColor); 
    });     

    // click sent to client
    socket.on('drawClick', function(data){
        colorChange(data.penColor);
        drawClick(data.x,data.y,data.penSize);
        colorChange(penColor);
    });
    
    // drag to client
    socket.on('drawDrag',function(data){  
        colorChange(data.penColor);
        drawDragRatio(data.prevRatioX,data.prevRatioY,data.currRatioX,data.currRatioY,data.penRatio);        
        pen();
        colorChange(penColor);
    });

    // when shape is sent to client
    socket.on('shapeEmit', function(data){
        colorChange(data.color);
        var change;
        var prevLw = ctx.lineWidth;
        switch(data.type[0]){
            case 'c':
                if('c' === data.type){
                    drawCircle(data.centerX,data.centerY,data.radius);
                }else{
                    switch(data.type){
                        case 'cd':
                                ctx.lineWidth = data.lw;
                                clearCircle(data.centerX,data.centerY,data.radius);
                                drawCircle(data.centerX,data.centerY,data.radius);
                                ctx.lineWidth = prevLw;
                           break;
                        case 'cco':
                                ctx.lineWidth = data.lw;
                                drawCircle(data.centerX,data.centerY,data.radius);
                                ctx.lineWidth = prevLw;
                          break;
                        case 'ct': 
                                ctx.lineWidth = data.lw;
                                drawCircle(data.centerX,data.centerY,data.radius);
                                ctx.lineWidth = prevLw;
                         break; 
                    }
                }
                break;
                
            }
        colorChange(penColor); 
    });     

    socket.on('messageReceived', function(data){
        $('#messages').append('<li class="otherSent">'+data.message+"<br>~ "+data.user+'<hr></li>');
        var height = 0;
        $('#messages li').each(function(i, value){
            height += parseInt($(this).height());
        });
        height += '';
       
        $('#chatWindow').animate({scrollTop:height},0);
});

    socket.on('status', function(myStatus){
       updateStatus(myStatus);
      socket.emit('join', myStatus); 
    });


/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 * 
 *
 * Brush Functions
 *
 *
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%*/

// fur && fur rotate
function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function angleBetween(point1, point2) {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function furBrush(currP, prevP,img){
    var distance = distanceBetween(prevP, currP);
    var angle = angleBetween(prevP, currP);

    for (var i = 0; i < distance; i++) {
        x = prevP.x + (Math.sin(angle) * i) - 25;
        y = prevP.y + (Math.cos(angle) * i) - 25;
        ctx.drawImage(img, x, y, ctx.lineWidth, ctx.lineWidth);

    }

}

function furRotateBrush(currP, prevP,img){
    var dist = distanceBetween(prevP, currP);
    var angle = angleBetween(prevP, currP);

    for (var i = 0; i < dist; i++) {
        x = prevP.x + (Math.sin(angle) * i);
        y = prevP.y + (Math.cos(angle) * i);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(0.5, 0.5);
        ctx.rotate(Math.PI * 180 / getRandomInt(0, 180));
        ctx.drawImage(img, 0, 0, ctx.lineWidth, ctx.lineWidth);
        ctx.restore();
  }
}


// Not working properly
// currP px,py(previous),x,y,randomWidth
function variableWidthBrush(currP){
    ctx.beginPath();
    ctx.moveTo(currP.px, currP.py);
    ctx.lineWidth = getRandomInt(ctx.lineWidth-1,ctx.lineWidth+1);
    ctx.lineTo(currP.x, currP.y);
    ctx.stroke();

}

function sprayBrush(currP){
    var radius = ctx.lineWidth;

}

});
