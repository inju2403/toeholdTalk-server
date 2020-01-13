var http=require('http');
var mongoose=require('mongoose');
var multer=require('multer');
var bodyParser=require('body-parser');
var path=require('path');

var app=require('./app').create();
var schema=require('./schema');
var socket=require('./socket');

var database;
var storage=multer.diskStorage({
	destination:function(req, file, cb){
		cb(null,'./uploads')
	},
	filename:function(req, file, cb){
		var ext=path.extname(file.originalname);
		cb(null, file.originalname)
	}
});
var upload=multer({storage:storage});


app.post('/hi/', function(req, res, next){
	console.log('hi called');
	console.log(req.body.id);
	res.send({message:"wonsik hi"});
});

app.post('/uploadImage/', upload.single('image'), function(req, res, next){
	console.log('upload called');
	console.log(req.file.path);
	database.userModel.findById(req.body.userId, function(err, result){
		if(err) console.log('error uploadimage find');
		else{
			database.userModel.update({id:req.body.userId},{imagePath:req.file.path}, function(err, numAffected) 				{
					console.log('succed');	});		
		}
	});
	res.sendFile(req.file.path, {root:__dirname});
});


var server=http.createServer(app).listen(5000, function(){
	console.log('server start');
	connectDB();
});



function connectDB(){
	var databaseUrl="mongodb://localhost:27017/myproject";

	mongoose.Promise=global.Promise;
	mongoose.connect(databaseUrl, {useNewUrlParser:true});
	database=mongoose.connection;

	database.on('error', console.error.bind(console, 'mongoose connection error'));


	database.on('open', function(){
		console.log('database connected');
		
		schema.init(mongoose);

		database.userSchema=schema.user();
		database.userModel=mongoose.model('members', database.userSchema);
		
		console.log('userSchema & userModel defined');	

		database.chatSchema=schema.message();
		database.chatModel=mongoose.model('messages', database.chatSchema);

		console.log('chatSchema & chatModel defined');

		socket.open(server, database);
	});

}
