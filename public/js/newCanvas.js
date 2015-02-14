$(document).ready(function(){

    function Color(color, opacity){
        this.color = color;
        this.opacity = opacity;

    }
    function Point(x, y, color, opacity){
        this.x = x;
        this.y = y;
        this.color = new color(color,opacity);
    }
    function tool(type, options){
        this.type = type;
        this.options = options;
    }
    
});
