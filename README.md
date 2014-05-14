RabbitMQ Manager
================

This utility began as a quick way to check the current queue status of a RabbitMQ instance. Whilst I was making use of the original tool, I decided that it made sense to expand to cover the entirety of the RabbitMQ Management APIs - which is what this utility is.

It's designed to be a light utility in order to quickly check on and modify queues without needing to log onto your servers etc. Please note that your server must have the [RabbitMQ Management Plugin](https://www.rabbitmq.com/management.html) enabled to work with this utility.

### Installation ###

Just install this module globally to have easy access to the utility. You must have NodeJS and NPM installed:

```
sudo npm install -g rabbitmq-manager
```

Which will allow you to access the utility using either `rabbit` or `rabbit-manager` commands.

### Usage ###

There are two main drivers in this utility, `query` and `queue`. The `queue` command returns a representation of the current RabbitMQ (information from the `/api/overview` endpoint).

The `query` command is the entry command to calling __any__ of the other [RabbitMQ Management APIs](http://hg.rabbitmq.com/rabbitmq-management/raw-file/3646dee55e02/priv/www-api/help.html "RabbitMQ API Docs"). Read the `Drivers` section below to see an overview of each command.

### Configurations ###

In order to make it easier to maintain multiple RabbitMQ clusters and setups, this utility contains the concept of configurations. You can create configurations using the `rabbit set` command, like below:

```
rabbit set <configuration-name>
```

You will then be prompted for the hostname, port and credentials. If you don't enter any of these fields, defaults will be used.

```
// Defaults

host : localhost
port : 15672
user : guest
pass : guest
```

This will set up a configuration with your settings, which you can use for quick access to a cluster later. You can also use `rabbit unset <configs>` to remove a stored configuration.

You can view the current configurations using `rabbit config`. This command takes an optional parameter of a specific configuration name in case you want to view a specific configuration.

Here's an example flow of using configurations:

```
$ rabbit set my-config

Please enter the desired host name: example.com
Please enter the desired port:
Please enter the desired username: some-user
Please enter the desired password: some-pass

Your configuration has been saved. You can use it by passing --conf.

$ rabbit config my-config
{
    "host": "example.com",
    "port": "15672",
    "username": "some-user",
    "password": "some-pass"
}

$ rabbit unset my-config

$ rabbit config
{}
```

### Drivers ###

As mentioned previously, the two main drivers of this utility are `queue` and `query`. Both of these commands take these parameters:

```
-c, --conf, --config

-p, --pass, --password
-u, --user, --username

--rabbit-host
--rabbit-port
```

If a configuration isn't specified (see the section above), the rest of the flags are required, however they will revert to default values (again, see above) if not provided. In addition to these flags, each command has some unique arguments.

#### rabbit queue ####

Prints a representation of the current RabbitMQ status. Can be used to poll the status every X seconds in order to keep checking on a queue. This feature is controlled via the `--poll` flag. If a value isn't specified alongside `--poll` a 5 second poll is used. Below is an example of the output of this command:

```
$ rabbit queue --conf test-conf

Messages are moving at the below rates:

Publish:      	 33.6/s
Deliver:      	   19/s
Redelivered:  	    0/s
Acknowledged: 	 18.8/s

There are currently no backed up messages.
```

#### rabbit query ####

Used to call any of the RabbitMQ APIs, returning the raw (but formatted) JSON responses. This command accepts the following flags:

```
--api
--method
--payload
```

where `--api` is the RabbitMQ API to call, `--method` is the method to call it with, and `--payload` is the payload to use alongside the request (if needed). This payload needs to be wrapped in quotes to be properly parsed.

Here is an example of `rabbit query` in use:

```
$ rabbit query --api /api/vhosts --conf test-conf
[
    {
        "message_stats": {
            "ack": 70519730,
            "ack_details": {
                "rate": 0
            },
            "deliver": 70520060,
            "deliver_details": {
                "rate": 0
            },
            "deliver_get": 70520060,
            "deliver_get_details": {
                "rate": 0
            },
            "publish": 141152197,
            "publish_details": {
                "rate": 0
            },
            "redeliver": 330,
            "redeliver_details": {
                "rate": 0
            }
        },
        "messages": 0,
        "messages_details": {
            "rate": 0
        },
        "messages_ready": 0,
        "messages_ready_details": {
            "rate": 0
        },
        "messages_unacknowledged": 0,
        "messages_unacknowledged_details": {
            "rate": 0
        },
        "recv_oct": 30344468667,
        "recv_oct_details": {
            "rate": 0
        },
        "send_oct": 18771209205,
        "send_oct_details": {
            "rate": 0
        },
        "name": "/",
        "tracing": false
    }
]
```

### Misc. ###

If you have any suggested improvements, or find any issues with this module, leave a note in the [issues](https://github.com/iwhitfield/rabbitmq-manager/issues "RabbitMQ Manager Issues") section. Feel free to reach out to me if you have any questions.
