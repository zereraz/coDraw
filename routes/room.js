var roomId;
var userName;
var roomLord = {};

// Get room.jade
exports.gRoom = function(req,res){
    res.render('room');
};

// Get roomId
exports.getRoom = function(){
    return roomId;
};

// Get the username
exports.getUser = function(){
    return userName;
};

exports.deleteRoom = function(room){
    delete roomLord[room]; 
};

exports.deleteUser = function(user,room){
    console.log(user+" "+room);
    var i = roomLord[room].userList.indexOf(user);
    if(i!==-1){
        roomLord[room].userList.splice(i,1);
    }
};

exports.userCheck = function(req,res){
    var user = req.query.username;
    var room = req.query.room;
    if(roomLord[room]!==undefined){
        if(roomLord[room].userList.indexOf(user)!==-1){
            res.send('-1');
        }else{
            res.send('1');
        }
    }else{
        res.send('1');
    }
};

// Post from home.jade
exports.pRoom = function(req,res){

    userName = req.body.uname;
    roomId = req.body.roomId;

    if(roomLord[roomId]===undefined){
        roomLord[roomId] = {users:1,userList:[userName]};
    }else{
        roomLord[roomId].users += 1;
        if(roomLord[roomId].userList.indexOf(userName)===-1){
            roomLord[roomId].userList.push(userName);
        }
    }
    res.render('room');
};
