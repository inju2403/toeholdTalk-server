var mongoose;

function init(mong){
	mongoose=mong;
}

function user(){
	var userSchema=mongoose.Schema({
			'id':String,
			'password':String,
			'name':String,
			'friends':[{id:String, name:String}],
			'chats':[{id:String, name:String, message:String, time:String}],
			'imagePath':String
	});
		
	userSchema.static('findById', function(id, callback){
		return this.find({id:id}, callback);
	});

	userSchema.static('findAll', function(callback){
		return this.find({},callback);
	});	

	return userSchema;
}

function message(){
	var chatSchema=mongoose.Schema({
		'sender':String,
		'receiver':String,
		'message':String,
		'time':String
	});

	chatSchema.static('findMessages', function(myId, yourId, callback){
		return this.find({$or:[{sender:myId, receiver:yourId},{sender:yourId, receiver:myId}]}, callback);
	});

	return chatSchema;
}

module.exports.init=init;
module.exports.user=user;
module.exports.message=message;
