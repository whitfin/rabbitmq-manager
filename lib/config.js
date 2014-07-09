var config = require('../utils/config');

delete config['default'];
if(process.argv[3]){
    console.log((config[process.argv[3]] ? config[process.argv[3]] : config).pretty());
} else {
    console.log(config.pretty());
}