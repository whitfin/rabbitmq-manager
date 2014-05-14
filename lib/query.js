var args = require('minimist')(process.argv.slice(3)),
	http = require('http'),
	params = require('../utils/params');

var api = args.a || args.api,
	method = args.m || args.method || "GET",
	payload = args.pl || args.payload;

if(!api){
	console.log('\nPlease make sure to enter an API path.\n');
	process.exit(1);
}

if((method == "PUT" || method === "POST") && !payload){
	console.log('\nPlease make sure to enter a payload for PUT or POST requests.\n');
	process.exit(1);
}

var host = params.host,
	pass = params.pass,
	port = params.port,
	user = params.user;

var opts = {
	auth:~user.indexOf(':') ? user : user + ':' + pass,
	hostname:host,
	method:method,
	path:'/api' + api.replace(/\/api/g, ''),
	port:port,
	headers:{
		"Content-Type":"application/json"
	}
};

var req = http.request(opts, function(res){
	var data = '';
	res.on('data', function(d){
		data += d;
	});

	res.on('end', function(){
		console.log(JSON.parse(data).pretty());
	});

	res.on('error', function(e){
		console.log(e);
	});
});

if(method == "POST" || method == "PUT"){
	req.write(payload);
}

req.end();