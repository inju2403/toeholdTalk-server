var servestatic=require('serve-static');
var bodyParser=require('body-parser');
var path=require('path');
var express=require('express');

var app=express();

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended:false, limit:'50mb', parameterLimit:50000}));
app.use('/uploads', servestatic(path.join(__dirname,'uploads')));


function create(){
	return app;
}

module.exports.create=create;
