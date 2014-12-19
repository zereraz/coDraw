var myRoom = 0;
var rooms = [];
exports.getRoom = function(req, res){

	if(req.session.roomId !== undefined){
		res.render('canvas');
	}else{
	
		res.redirect('/');
	}
}

exports.getRoom = function(){
    return myRoom;
}

exports.pCreateRoom = function(req, res){

	var roomId = req.body.roomId;
    if(rooms.indexOf(roomId)==-1){
        rooms.push(roomId);    
        req.session.roomId = roomId;
        myRoom = roomId;
        res.render("canvas");
    }else{
        res.send("Room not available");
    }
	
}

exports.pJoinRoom = function(req, res){
    var roomId = req.body.roomId;
    if(rooms.indexOf(roomId)!=-1){
        req.session.roomId = roomId;
        myRoom = roomId;
        res.render("canvas");
    }else{
        res.send("Room does not exist, Please create one to join");
    }

}
