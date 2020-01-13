function init(io, soc, db){
	soc.on('messageInfo', function(data){
		update(soc, db, data);
	});

	soc.on('sendMessage', function(data){
		sendMessage(io, soc, db, data);
	});
}

function update(socket, database, data){
	var chatModel=database.chatModel;

	chatModel.findMessages(data.myId, data.yourId, function(err, result){
			if(err) console.log('findMessages error');
			else{
				var chatlist=[];
				for(var i=0; i<result.length; i++){
					var res=result[i];
					chatlist.push({sender:res._doc.sender, receiver:res._doc.receiver,
						message:res._doc.message, time:res._doc.time});
				}
				socket.emit('update', chatlist);
			}
	});
}


function sendMessage(io, socket, database, data){
	var userModel=database.userModel;
	var chatModel=database.chatModel;
	var sender=data.sender;
	var senderName=data.senderName;
	var receiver=data.receiver;
	var receiverName=data.receiverName;
	var message=data.message;
	var time=data.time;

	console.log(senderName+''+receiverName);

	var newMessage=new chatModel({sender:sender, receiver:receiver, message:message, time:time});

	newMessage.save(function(err){
		if(err) console.log('sendMessage error');
		else console.log('sendMessage succeed');
		
		userModel.findById(sender, function(err, result){
			if(err) console.log('message.js sendMessage findSender error');
			else{
				var chats=result[0]._doc.chats;
				for(var i=0; i<chats.length; i++){
					if(chats[i].id==receiver){
						chats.splice(i,1);
						chats.unshift({id:receiver, name:receiverName, message:message, time:time});
						userModel.update({id:sender},{chats:chats}, function(err, numAffected){
							if(err) console.log('chats update error');
						});
						socket.emit('resultChatList', chats);
						return;
					}
				}

				chats.unshift({id:receiver, name:receiverName, message:message, time:time});
				userModel.update({id:sender}, {chats:chats}, function(err, numAffected){
					if(err) console.log('chat update error2');
				});
				socket.emit('resultChatList', chats);
			}
		});

		userModel.findById(receiver, function(err, result){
			if(err) console.log('message.js sendMessage findSender error');
			else{
				var chats=result[0]._doc.chats;
				for(var i=0; i<chats.length; i++){
					if(chats[i].id==sender){
						chats.splice(i,1);
						chats.unshift({id:sender, name:senderName, message:message, time:time});
						userModel.update({id:receiver},{chats:chats}, function(err, numAffected){
							if(err) console.log('chats update error');
						});
						var users=require('./socket').users;
						if(users[receiver]){
							if(io.sockets.sockets[users[receiver]]!=undefined){
							io.sockets.connected[users[receiver]].emit('resultChatList', chats);
							}
						}
						return;
					}
				}

				chats.unshift({id:sender, name:senderName, message:message, time:time});
				userModel.update({id:receiver}, {chats:chats}, function(err, numAffected){
					if(err) console.log('chat update error2');
				});
				var users=require('./socket').users;
				if(users[receiver]){
					if(io.sockets.sockets[users[receiver]]!=undefined){
						io.sockets.connected[users[receiver]].emit('resultChatList', chatlist);
					}
				}
			}
		});

		var chatlist=[];
		chatModel.findMessages(sender, receiver, function(err, result){
			if(err) console.log('findMessages error');
			else{
				for(var i=0; i<result.length; i++){
					var res=result[i];
					chatlist.push({sender:res._doc.sender, receiver:res._doc.receiver,
						message:res._doc.message, time:res._doc.time});
				}
				socket.emit('update', chatlist);

				var users=require('./socket').users;
				if(users[receiver]){
					if(io.sockets.sockets[users[receiver]]!=undefined){
						io.sockets.connected[users[receiver]].emit('update', chatlist);
					}
				}
			}
		});
	});
}

module.exports.init=init;
	
	
	
	


