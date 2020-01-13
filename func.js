function init(soc, db){
	soc.on('searchId', function(data){
		searchId(soc, db, data);
	});

	soc.on('addFriend', function(data){
		addFriend(soc, db, data);		
	});
}


function searchId(socket, database, id){
	var userModel=database.userModel;
	userModel.findById(id, function(err, result){
		if(result.length>0) socket.emit('resultSearchId', {id:id, name:result[0]._doc.name});
		else socket.emit('resultSearchId', {id:'', name:''});
	});
}

function addFriend(socket, database, data){
	var userModel=database.userModel;
	var myId=data.myId;
	var yourId=data.yourId;
	var yourName=data.yourName;
	userModel.findById(myId, function(err, result){
		if(err){
			console.log('addFriend error');
			socket.emit('resultAddFriend', 0);
			return;
		}

		var friends=result[0]._doc.friends;
		for(var i=0; i<friends.length; i++){
			if(friends[i].id==yourId){
				console.log('already in friendlist');
				socket.emit('resultAddFriend',1);
				return;
			}
		}

		friends.unshift({id:yourId, name:yourName});	
		if(friends.length>1){
			friends.sort(function(a,b){
				return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
			});
		}
	
		userModel.update({id:myId}, {friends:friends}, function(err, numAffected){
			if(err){
				console.log('addFriend update failed');
				socket.emit('resultAddFriend',0);
				return;
			}

			console.log('addFriend succeed');
			socket.emit('resultAddFriend', 2);
		});
	});
}

module.exports.init=init;
