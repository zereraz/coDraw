exports.getRoom = function(req, res){

	if(req.session.roomId !== undefined){
		console.log(req.session.roomId);	
		res.render('canvas');
	}else{
	
		res.redirect('/');
	}
}


exports.postRoom = function(req, res){

	var roomId = req.body.roomId;
	req.session.roomId = roomId;
	res.render("canvas");
	
}
