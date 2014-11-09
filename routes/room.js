
exports.postRoom = function(req,res){

	var roomId = req.body.roomId;
	req.session.roomId = roomId;
	res.render("canvas");
	
}
