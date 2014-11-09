/*==========================
 *
 *	DEPENDENCIES & GLOBAL VARIABLES
 *
==========================*/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = 3000;
//routes
var index = require('./routes/index');



/*==========================
 *
 * 	MIDDLEWARE
 *
==========================*/


//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));

// parse application/json
app.use(bodyParser.json());

//js css img
app.use(express.static(__dirname+'/public'));

//jade
app.set('view engine','jade');

//views
app.set('views',__dirname+'/views');

/*==========================
 *
 *	ROUTES
 *
==========================*/


app.get('/',index.root);


/*==========================
 *
 *	LISTENING ON PORT 3000
 *
==========================*/
app.listen(port, function(){

	console.log("listening on port "+port);
});
