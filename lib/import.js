var config = require(__config),
    fs = require('fs'),
    schema = require('../utils/schema');

var newConf;

try {
    newConf = JSON.parse(process.argv[3]);
} catch(e) {
    try {
        if(fs.existsSync(process.argv[3])) {
            newConf = JSON.parse(fs.readFileSync(process.argv[3]))
        } else {
            console.log('\nCould not find input file!\n');
            process.exit(1);
        }
    } catch(e) {
        console.log('\nUnable to parse config file!\n');
        process.exit(1);
    }
}

if(!newConf['default']){
    newConf['default'] = config['default'];
}

fs.writeFileSync(__config, schema(newConf).pretty());