$('document').ready(function(){
 
 	// load joinable rooms 
 	var availableRooms = [];
 	var joinButtons = [];
	console.log('Home');

    var socket = io();
	// $('.sub').on('click', function(){
 	   
	// });
	socket.emit('requestAvailableRooms',0);
 	socket.on('availableRooms', function(rooms){ 
 		
 		availableRooms = rooms;
 		console.log(rooms);
 		refreshButtons();
    });

	socket.on('namesInRoom', function(room){
		
    });


	function refreshButtons()
	{ 
		for (var i = availableRooms.length - 1; i >= 0; i--) {
			console.log(rooms);
			addJoinButton(availableRooms[i]);
		};
	}

	function addJoinButton(val){
	
		var element=document.createElement("input");
		element.setAttribute("type",'button');
		element.setAttribute("value",val);
		element.setAttribute("name",'joinButton');
		element.setAttribute("class",'joinButton');
		element.setAttribute("id",'joinButton'+val);
		var foo=document.getElementById("joinButtons");
		// $('.joinButton').on('click',function(){
		
		element.addEventListener('click', function() {
			//onclick
			$('#roomId2').val(val);
			$('form#form2').submit();

		}, false);

		foo.appendChild(element);
		socket.on('namesInRoom', function(room){
			
	    });

	}

	$('#uname1').keypress(function(e){
 		$('#uname2').val($('#uname1').val());
 		$('#uname3').val($('#uname1').val());
	});

	$('#roomId1').keypress(function(e){ 
 		if(e.which == 13){
      		// e.preventDefault();
 			var roomId = ($('#roomId1').val());
 			console.log(roomId);
 			socket.emit('createRoomChecker',roomId);
 			
 		}
	});

	socket.on('createRoomPass',function(n){
		if(n == -1){
 			$('#roomId1').val('');
			alert('Room already exists');
		}else{
			$('form#form1').submit();
		}
    });
});



