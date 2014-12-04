$(document).ready(function(){
    var socket = io();
    socket.on('hello',function(msg){
        alert(msg);
    });
});

