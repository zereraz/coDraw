$(document).ready(function(){
    var preventForm = true;
    $('form').submit(function(e){
        var userName = $('#username').val();
        var room = $('#room').val();
        if(preventForm){
            e.preventDefault();
        }
        if(userName.length === 0 || room.length === 0){
            $('#error h3').text("Both fields need to be filled");
            return false;
        }else{
            $('#error h3').text('');
            $.get('/usercheck',{"username":userName,"room":room},function(data){
                if(data ==='-1'){
                    $('#error h3').text("USERNAME ALREADY TAKEN"); 
                }else{
                    preventForm = false;
                    $('form').submit();
                    return true;
                }

            });
        }
        
    });
});
