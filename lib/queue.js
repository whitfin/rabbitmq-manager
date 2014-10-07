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
			console.log(getRates(message_stats));

			var time = msToString((queue_totals.messages / message_stats.deliver_details.rate) * 1000),
				backlog = msToString((queue_totals.messages / queue_totals.messages_details.rate) * 1000 * -1);

			if (new RegExp("^$|\b\b?").test(time)) {
				time = null;
			}

			if (queue_totals.messages) {
				console.log('There are currently ' + queue_totals.messages.comma() +
					' backed up messages, ' + (queue_totals.messages_details.rate > 0 ? 'increasing' : 'decreasing') +
					' at a rate of ' + Math.abs(queue_totals.messages_details.rate.toString()) + '/s.\nAt the current rate an event would' +
					' take ' + (time ? time : 'under a second') + ' to get through the queue.');
				if(queue_totals.messages_details.rate < 0){
					console.log("It will take approximately " + backlog + " to clear out the current backlog.\n");
				} else {
					console.log("");
				}
			} else {
				console.log('There are currently no backed up messages.\n');
			}

			if (poll) {
				setTimeout(function(){
					keepPolling((queue_totals.messages ? 11 : 10) + (queue_totals.messages && queue_totals.messages_details.rate < 0 ? 1 : 0));
				}, (poll == true ? 5 : poll) * 1000);
			}
		});
	});
}

/**
 * Simply right aligns a bunch of rates based on length.
 *
 * @param rate			the rate value
 * @param longest       the longest rate to print
 * @returns {string}	the right aligned rate
 */
function getRate(rate, longest){
	return new Array(1 - (rate.comma().length - longest)).join(' ') + rate.comma() + '/s';
}

/**
 * Just adds commas to the rates and ensures they're
 * printed correctly via the addRate method above.
 *
 * @param rates         the object of rates
 * @returns {string}    the right aligned rates
 */
function getRates(rates){
    var strRates = [
        rates.publish_details.rate.comma(),
        rates.deliver_details.rate.comma(),
        rates.redeliver_details.rate.comma(),
        rates.ack_details.rate.comma()
    ];
    var longest = 0;
    strRates.forEach(function(rate){
        if(rate.length > longest){
            longest = rate.length;
        }
    });
    return 'Publish:      \t' + getRate(rates.publish_details.rate, longest) + '\n' +
           'Deliver:      \t' + getRate(rates.deliver_details.rate, longest) + '\n' +
           'Redelivered:  \t' + getRate(rates.redeliver_details.rate, longest) + '\n' +
           'Acknowledged: \t' + getRate(rates.ack_details.rate, longest) + '\n';
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
    return (hrs ? hrs + 'h ' : '') + (mins ? mins + 'm ' : '') + (secs ? secs + 's' : mins ? '\b' : hrs ? '\b' : '');
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
