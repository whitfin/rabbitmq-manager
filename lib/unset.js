var args = process.argv.slice(3).toLowerCase(),
    config = require('../utils/config');

for(var i = 0, j = args.length; i < j; i++){
    if(args[i] != "default") delete config[args[i]];
}

require('fs').writeFileSync(__config, config.pretty());