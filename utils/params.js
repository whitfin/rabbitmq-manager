var args = require('minimist')(process.argv.slice(3)),
    config = require(__config);

var conf = args.c || args.conf || args.config,
    poll = args.poll || false;

var pass = args.p || args.pass || args.password || config[conf] ? config[conf].password : undefined,
    user = args.u || args.user || args.username || config[conf] ? config[conf].username : undefined;

if((!user || (!pass && !~user.indexOf(':'))) && !conf){
    console.log('\nPlease enter a valid username and password.\n');
    process.exit(1);
}

if(conf && !config[conf]){
    console.log('\nPlease ensure to setup a configuration for ' + conf + '.\n');
    process.exit(1);
}

var host = args['rabbit-host'] || config[conf || 'default'].host,
    port = args['rabbit-port'] || config[conf || 'default'].port;

module.exports = {
    host:host,
    pass:pass,
    poll:poll,
    port:port,
    user:user
};