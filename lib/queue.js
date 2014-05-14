var args = require('minimist')(process.argv.slice(3)),
	http = require('http'),
	params = require('../utils/params');

var host = params.host,
	pass = params.pass,
	poll = params.poll,
	port = params.port,
	user = params.user;

var opts = {
	auth:~user.indexOf(':') ? user : user + ':' + pass,
	hostname:host,
	path:'/api/overview',
	port:port
};

keepPolling();
function keepPolling(reset){
	http.get(opts, function (res) {
		if (res.statusCode != 200) {
			console.log('\nCouldn\'t retrieve RabbitMQ details due to a ' + res.statusCode + ' status code.\n');
			process.exit(1);
		}

		var data = '';
		res.on('data', function (d) {
			data += d;
		});

		res.on('end', function () {
			if (args.r || args.raw) {
				console.log(JSON.parse(data).pretty());
				process.exit();
			}

			var response = JSON.parse(data),
				message_stats = response.message_stats,
				queue_totals = response.queue_totals;

			if(reset) resetTerminal(reset);

			console.log('\nMessages are moving at the below rates:\n');
			console.log('Publish:      \t' + getRate(message_stats.publish_details.rate));
			console.log('Deliver:      \t' + getRate(message_stats.deliver_details.rate));
			console.log('Redelivered:  \t' + getRate(message_stats.redeliver_details.rate));
			console.log('Acknowledged: \t' + getRate(message_stats.ack_details.rate) + '\n');

			var time = msToString((queue_totals.messages / message_stats.deliver_details.rate) * 1000);
			if (queue_totals.messages) {
				console.log('There are currently ' + queue_totals.messages.comma() +
					' backed up messages, ' + (queue_totals.messages_details.rate > 0 ? 'increasing' : 'decreasing') +
					' at a rate of ' + Math.abs(queue_totals.messages_details.rate.toString()) + '/s.\nAt the current rate an event would' +
					' take ' + (time != '' ? time : 'under a second') + ' to get through the queue.\n');
			} else {
				console.log('There are currently no backed up messages.\n');
			}

			if (poll) {
				setTimeout(function(){
					keepPolling(queue_totals.messages ? 11 : 10);
				}, (poll == true ? 5 : poll) * 1000);
			}
		});
	});
}

/**
 * Simply right aligns a bunch of rates based on length.
 *
 * @param rate			the rate value
 * @returns {string}	the right aligned rate
 */
function getRate(rate){
	return new Array(5 - rate.toString().length + 1).join(' ') + rate.comma() + '/s';
}

/**
 * Converts a time in milliseconds to a readable string
 *
 * @param ms			the time in millis to convert
 * @returns {string}	a human readable string
 */
function msToString(ms) {
	var millis = ms % 1000,
		ms = (ms - millis) / 1000,
		secs = ms % 60,
		ms = (ms - secs) / 60,
		mins = ms % 60,
		hrs = (ms - mins) / 60;
	return (hrs ? hrs + 'h ' : '') + (mins ? mins + 'm ' : '') + (secs ? secs + 's' : '');
}

/**
 * Resets the Terminal screen to overwrite the previous log.
 *
 * @param lines			the number of lines to reset
 */
function resetTerminal(lines){
	process.stdout.write("\033[" + lines + "A\033[J");
	process.stdout.cursorTo(0);
}
