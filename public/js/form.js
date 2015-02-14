$(document).ready(function(){

    function loadingOn(){
        var sub = $('#sub');
        var clss = sub.attr('class');
        clss += " loading";
        sub.attr('class',clss);
    }
    function loadingOff(){
        var sub = $('#sub');
        var clss = sub.attr('class');
        clss = clss.substring(0,clss.length-8);
        sub.attr('class',clss);
    }

    $('#sub').click(function(e){
        var userName = $('#username').val();
        var room = $('#room').val();
        if(userName.length === 0 || room.length === 0){
            $('#error h3').text("Both fields need to be filled");
            return false;
        }else{
            $('#error h3').text('');
            loadingOn();
            $.get('/usercheck',{"username":userName,"room":room},function(data){
                if(data ==='-1'){
                    $('#error h3').text("USERNAME ALREADY TAKEN"); 
                    loadingOff();
                }else if(data === 0){
                    preventForm = false;
                    $('form').submit();
                    return true;
                }else{
                    preventForm = false;
                    $('form').submit();
                    return true;
                }

            });
        }
    });
});
