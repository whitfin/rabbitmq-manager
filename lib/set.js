var config = require('../utils/config'),
	fs = require('fs'),
	readline = require('readline');

if(!process.argv[3]){
	console.log("\nPlease enter a configuration name.\n");
	process.exit(1);
}

var name = process.argv[3].toLowerCase(),
	reader = readline.createInterface(process.stdin, process.stdout);

function getOverwrite(done){
	reader.question('This configuration exists. Do you wish to overwrite? [no] ', function(answer) {
		console.log("");
		if(answer == 'y' || answer == 'yes'){
			config[name] = {};
			getHost(done);
		} else {
			process.exit(1);
		}
	});
}

function getHost(done){
	reader.question('Please enter the desired host name: ', function(answer) {
		config[name].host = answer != "" ? answer : config['default'].host;
		getPort(done);
	});
}

function getPort(done){
	reader.question('Please enter the desired port: ', function(answer) {
		config[name].port = answer != "" ? answer : config['default'].port;
		getUser(done);
	});
}

function getUser(done){
	reader.question('Please enter the desired username: ', function(answer) {
		config[name].username = answer != "" ? answer : config['default'].username;
		getPass(done);
	});
}

function getPass(done){
	reader.question('Please enter the desired password: ', function(answer) {
		config[name].password = answer != "" ? answer : config['default'].password;
		done();
	});
}

(function(){
	function done(){
		fs.writeFileSync(__config, config.pretty());
		console.log('\nYour configuration has been saved. You can use it by passing --conf.\n');
		process.exit(0);
	}

	console.log("");
	if(config[name]){
		getOverwrite(done);
	} else {
		config[name] = {};
		getHost(done);
	}
}());