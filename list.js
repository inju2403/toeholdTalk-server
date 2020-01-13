function init(soc, db){
	var database=db;
	var userModel=db.userModel;
	var socket=soc;
	
	socket.on('requestFriendList', function(data){
		console.log('requestFriendList called');
		userModel.findById(data, function(err, result){
			if(err){
				console.log('error');
				return;
			}
			friends=result[0]._doc.friends;
			var res=[];
			for(var i=0; i<friends.length; i++){
				var cnt=0;
				console.log(friends[i]._doc.id);
				userModel.findById(friends[i]._doc.id, function(err, result){
					if(err) console.log('error');
					if(result.length==0) console.log('result 0');
					else {
					res.push({id:result[0]._doc.id, name:result[0]._doc.name, imageUrl:result[0]._doc.imagePath});
						
						cnt++;
						if(cnt==friends.length){
							socket.emit('resultFriendList', res);
							console.log('resultFriendList emit');
						}
					
				}});
			}
			//console.dir(res);	
			//socket.emit('resultFriendList', res);
			//socket.emit('resultFriendList', result[0]._doc.friends);
		});
	});

	socket.on('requestChatList', function(data){
		console.log('requestChatList called : '+ data);
		userModel.findById(data, function(err, result){
			if(err){
				console.log('error');
				return;
			}
			var res=result[0]._doc.chats;
			console.dir(res);			
			socket.emit('resultChatList', result[0]._doc.chats);
		});
	});
}

module.exports.init=init;




