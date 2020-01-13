var socketio=require('socket.io');


var auth=require('./auth');
var list=require('./list');
var func=require('./func');
var message=require('./message');

var io;
var database;
var users={};

function open(server, db){
	database=db;
	io=socketio.listen(server);
	io.sockets.on('connection', function(socket){	
		console.log('socket connected, ID : ' +socket.id);
		auth.init(socket, database);
		list.init(socket,database);
		func.init(socket,database);
		message.init(io,socket, database);
		
		socket.on('transferId', function(data){
			users[data]=socket.id;
			console.dir(users);
		});

		socket.on('getMyName', function(data){
			console.log('getmyname called');
			db.userModel.findById(data, function(err, result){
				if(err){
					console.log('getMyName findById error');
				}
				console.log(result[0]._doc.name+' '+result[0]._doc.imagePath);
				socket.emit('resultMyName', {name:result[0]._doc.name, imageUrl:result[0]._doc.imagePath});
			});
		});

		socket.on('powerOff', function(data){
			delete users[data];
			console.dir(users);
		});
	});


}

module.exports.open=open;
module.exports.users=users;
