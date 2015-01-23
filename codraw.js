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
var artbay = require('./routes/artbay');
var activeConnections = 0;
var myRoom = 0;
var roomLord = {};

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

//root , home page

app.get('/',index.home);


//room , drawing area
app.get('/room',room.gRoom);
app.post('/room',room.pRoom);
app.get('/usercheck',room.userCheck);
app.get('/artbay',artbay.home)


//port, to get port where heroku app is hosted
app.get('/port',function(req,res){
    res.send(port);
});


/*==========================
 *
 *	socket.io	
 *
==========================*/

io.on('connection', function(socket){
    myRoom = room.getRoom();
    if(myRoom !== 0){
        
        userName = room.getUser();
        if(roomLord[myRoom] === undefined){
            var idToUser = {};
            idToUser[socket.id] = userName;
            roomLord[myRoom] = {users:1,userList:[idToUser]};
        }else{
            var idToUser = {};
            idToUser[socket.id] = userName;
            roomLord[myRoom].users += 1;
            roomLord[myRoom].userList.push(idToUser);
            
        }
        
        socket.join(myRoom);
        
        var status = {
            "room":myRoom,
            'id':roomLord[myRoom].users,
            'username':userName,
            'users':roomLord[myRoom].users,
            'sid':socket.id
        };
        
        socket.emit('status',status);        
        socket.on('join', function(myStatus){
            
            // This is a new user that got status
            // Now we have to update everyone in that room's users
            socket.emit('updateUsers',"inc");
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
        socket.on('shape',function(shapeData){ 
            socket.broadcast.to(shapeData.room).emit('shapeEmit',shapeData); 
        });

        /*%%%%%%%%%%%%%%%%%%%%%%
         *
         *  Chat Application
         *
         *%%%%%%%%%%%%%%%%%%%%%%*/
        
        socket.on('messageSent', function (chatData){
            socket.broadcast.to(chatData.room).emit('messageReceived',chatData);
        });
    }else{
       //IDEA here room 0 where anyone can come, and draw
        io.sockets.emit('error','Problem resolving the roomId, Please rejoin');
    }

        socket.on('disconnect', function(){
            var id = socket.id;
            // roomLord gets an undefined key at beginning
            delete roomLord[undefined];
            var keys = Object.keys(roomLord);
            for(var i = 0 ; i < keys.length ; i++){
                var roomData = roomLord[keys[i]];
                var users = roomData.userList;
                for(var j = 0 ; j < users.length ; j++){
                    if(id == Object.keys(users[j])){ 
                        room.deleteUser(users[j][id],keys[i]);
                        users.splice(j,1);
                        roomData.users -= 1;
                    }
                }
                if(roomData.users===0){
                    room.deleteRoom(keys[i]);
                    delete roomLord[keys[i]];
                }
            }

            activeConnections--;
            socket.emit('updateUsers',"dec");
             
        });

});

/*==========================
 *
 *	LISTENING ON PORT 3000
 *
==========================*/
http.listen(port, function(){

	console.log("listening on port "+port);
});
