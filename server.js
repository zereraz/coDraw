/*==========================
 *
 *	DEPENDENCIES & GLOBAL VARIABLES
 *
==========================*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{transport:['websocket','polling']});


//middleware
var bodyParser = require('body-parser');
var session = require('express-session');  

var port = process.env.PORT || 3000;
//routes
var index = require('./routes/index');
var room = require('./routes/room');
var activeConnections = 0;
var myRoom = 0;

/*==========================
 *
 * 	MIDDLEWARE
 *
==========================*/


//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));

// parse application/json
app.use(bodyParser.json());

// session
app.use(session({
	secret: 'illusTraTions',
	cookie:{secure:true}
	}));

//js css img
app.use(express.static(__dirname+'/public'));

//jade
app.set('view engine','jade');

//views
app.set('views',__dirname+'/views');

/*==========================
 *
 *	ROUTES
 *
==========================*/

//root
app.get('/',index.root);
/*app.get('/', function(req,res){
    res.render('canvas');
});
*/
//room
app.get('/room', room.getRoom);
app.post('/createroom', room.pCreateRoom);
app.post('/joinroom', room.pJoinRoom);

//port
app.get('/port',function(req,res){
    res.send("port is "+port); 
});

/*==========================
 *
 *	socket.io	
 *
==========================*/

io.on('connection', function(socket){
    myRoom = room.getRoom();
    if(myRoom!=0){
        myRoom = room.getRoom();
        socket.join(myRoom);
        io.sockets.to(myRoom).emit('myRoom',myRoom);
    
        io.sockets.on('disconnect', function(){
            activeConnections--;
            io.sockets.emit('userDisconnected',activeConnections);
            room.pop(myRoom);
            socket.leave(myRoom);
        });
        io.sockets.in(myRoom).emit('roomPopulation',activeConnections);
            activeConnections++;
        
        socket.on('justClick',function(clickData){
            socket.broadcast.to(clickData.room).emit('drawClick',clickData); 
        });

        socket.on('dragDraw',function(dragData){
            socket.broadcast.to(dragData.room).emit('drawDrag',dragData); 
        });

        socket.on('text',function(textData){
            socket.broadcast.to(textData.room).emit('textEmit',textData); 
        });
    }else{
       //IDEA here room 0 where anyone can come, and draw
        io.sockets.emit('error','Problem resolving the roomId, Please rejoin');
    }
    /*
	io.sockets.emit('userconnect', activeConnections);
	socket.on('disconnect', function(){
		activeConnections--;
		io.sockets.emit('userdisconnet', activeConnections);
	});
	socket.on('drawprogress', function(uid, co_ordinates){
		io.sockets.emit('drawprogress', uid, co_ordinates);
	});
	socket.on('drawend', function(uid, co_ordinates){
		io.sockets.emit('drawend', uid, co_ordinates);
	});
*/


});

/*==========================
 *
 *	LISTENING ON PORT 3000
 *
==========================*/
http.listen(port, function(){

	console.log("listening on port "+port);
});
