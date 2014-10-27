var fs = require('fs');
var path = require('path');

var dir = path.join(__config, '..');

if(!fs.existsSync(dir)){
    try {
        fs.mkdirSync(dir);
    } catch(e) {
        if(e.code != 'EEXIST'){
            throw e;
        }
    }
    fs.writeFileSync(__config, require(path.join(__dirname, 'config.json')).pretty());
}