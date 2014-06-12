var config = require('../utils/config'),
	fs = require('fs'),
	schema = require('../utils/schema');

if(fs.existsSync(process.argv[3])) {
	var newConf = fs.readFileSync(process.argv[3]);

	try {
		newConf = JSON.parse(newConf);
	} catch(e) {
		console.log('\nUnable to parse config file!\n');
		process.exit(1);
	}

	if(!newConf['default']){
		newConf['default'] = config['default'];
	}

	fs.writeFileSync(__config, schema(newConf).pretty());
} else {
	console.log('\nCould not find input file!\n');
}