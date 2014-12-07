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
//app.get('/',index.root);
app.get('/', function(req,res){
    res.render('canvas');
});
//room
app.get('/room', room.getRoom);
app.post('/room', room.postRoom);

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
    io.sockets.emit('hello','Hello Shetty!');
    io.sockets.emit('roomPopulation',activeConnections);
	activeConnections++;
    
    socket.on('justClick',function(clickData){
        io.sockets.emit('drawClick',clickData); 
    });

    socket.on('dragDraw',function(dragData){
        io.sockets.emit('drawDrag',dragData); 
    });
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
