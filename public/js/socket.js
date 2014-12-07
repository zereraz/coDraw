$(document).ready(function(){
    var socket = io();
    socket.on('hello',function(msg){
        console.log("hello shetty");
    });
    socket.on('roomPopulation', function(activeConnections){
        console.log(activeConnections);
    });
});

