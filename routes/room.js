var myRoom = 0;
var myName = '';

var rooms = [];
var namesInRooms = [];

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

exports.getName= function(){
    return myName;
}

exports.getNamesInRooms= function(){
    return namesInRooms;
}

exports.getRooms= function(){
    return rooms;
}


exports.getNamesInMyRooms= function(myRoom){
    var namesInMyRooms = namesInRooms[rooms.indexOf(myRoom)];
    return namesInMyRooms;
}

exports.pop = function(room,name){
    
    console.log('Rooms: '+rooms);
    console.log('Names: '+names);
    console.log('r'+room+" n"+name);
    var i = rooms.indexOf(room);

    if(i>-1){
        var names = namesInRooms[i];
        for(var j = 0; j<names.length; j++){
            if(name == names[j]){
                names.splice(j,1);
            }
        }
    }

    for(var j = 0; j<namesInRooms.length; j++){
        var names = namesInRooms[j];
        if(names.length == 1){
            namesInRooms.splice(j,1);
            rooms.splice(j,1);
            j--;
        }
    }
    console.log('POPing');
    console.log('Rooms: '+rooms);
    console.log('Names: '+names);
}


exports.pCreateRoom = function(req, res){

	var roomId = req.body.roomId;
    
    if(rooms.indexOf(roomId)==-1){

        var uname = req.body.uname;
        if(uname == null || uname.trim() == ''){
            //generate name
            uname = gen_name();
        }
        rooms.push(roomId);
        req.session.roomId = roomId;
        req.session.uname = uname;
        myRoom = roomId;
        myName =uname;

        var names = ['',myName];
        namesInRooms.push(names);

        console.log('Rooms: '+rooms);
        console.log('Names in '+myRoom+': '+names);
        res.render("canvas");

    }else{
        res.send("Room not available");
    }
	
}

exports.pJoinRoom = function(req, res){
    
    var roomId = req.body.roomId;

    if(rooms.indexOf(roomId)!=-1){

        var uname = req.body.uname;
        if(uname == null || uname.trim() == ''){
            //generate name
            uname = gen_name();
        }
        req.session.roomId = roomId;
        req.session.uname = uname;
        myRoom = roomId;
        myName =uname;
 
        var i = rooms.indexOf(myRoom);
        var names = namesInRooms[i];
        names.push(myName); 
        namesInRooms.splice(i,1);
        namesInRooms.splice(i,1,names);

        console.log('Rooms: '+rooms);
        console.log('Names in '+myRoom+': '+names);
        res.render("canvas");
    }else{
        res.send("Room does not exist, Please create one to join");
    }

}
function gen_name()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}