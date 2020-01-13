function init(soc, db){
	soc.on('login', function(data){
		login(soc, db, data);
	});

	soc.on('register', function(data){
		register(soc, db, data);
	});
}

function login(socket, database, data){
	database.userModel.findById(data.id, function(err, result){
		if(err){
			console.log('findById error');
			socket.emit('loginResult', {result:0});
			return;
		}
		
		if(result.length==0){
			console.log('id doesnt exist');
			socket.emit('loginResult', {result:1});
			return;
		}

		if(result[0]._doc.password!=data.password){
			console.log('password not matched');
			socket.emit('loginResult', {result:2});
			return;
		}

		console.log('id&password matched');
		socket.emit('loginResult', {result:3});
	});
}
	
function register(socket, database, data){
	database.userModel.findAll(function(err, result){
		if(err){
			console.log('findAll error');
			socket.emit('registerResult', {result:0});
			return;
		}
		
		if(result.length>0){
			console.log('findAll found');
			for(var i=0; i<result.length; i++){
				if(result[i]._doc.id==data.id){
					console.log('id already exists');
					socket.emit('registerResult', {result:1});
					return;
				}
			}
		}
		
		var user=new database.userModel({id:data.id, password:data.password, name:data.name, friends:[], chats:[], imagePath:''});
		user.save(function(err){
			if(err){
				console.log('register error');
				socket.emit('registerResult', {result:0});
			} else{
				console.log('register succeed');
				socket.emit('registerResult', {result:2});
			}
		});
	});
}

module.exports.init=init;
