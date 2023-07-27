const Flatted = require('flatted');
const { promisify } = require('util');
const { evaluateMessage } = require('./lib/builder.js');
const Mustache = require('mustache');

/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    const prop = promisify(RED.util.evaluateNodeProperty);
    function DiscordSendNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.event = config.event;

        if (!config.useMsg) {
            if (!config.client) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'no client'
                });
                return;
            }
            /** @type {DiscordClientNode} node */
            let node = RED.nodes.getNode(config.client);
            this.clientNode = node;
        }

        this.on('input', async (msg, send, done) => {
            try {
                let channel = await prop(config.channel, config.channelSrc, this, msg);

                let reply = undefined;

                if (config.replySrc !== 'none') {
                    reply = await prop(config.reply, config.replySrc, this, msg);
                }

                let message;

                if (config.messageSrc === 'builder') {
                    message = await evaluateMessage(RED, this, msg, config.msg);
                } else {
                    message = await prop(config.message, config.messageSrc, this, msg);
                    if (config.messageSrc === 'str') {
                        message = Mustache.render(message, msg);
                    }
                }

                /** @type {import('discord.js').Client} */
                let client = config.useMsg ? msg.$dc().client : this.clientNode.client;

                let ch = await client.channels.fetch(channel);

                if (!ch.isTextBased()) {
                    throw new Error('channel is not a text based channel');
                }

                /** @type {import('discord.js').MessageCreateOptions} */
                let opts = {};

                if (typeof message === 'string') {
                    opts.content = message;
                } else if (typeof message === 'object') {
                    opts = {
                        content: message.content,
                        tts: message.tts,
                        nonce: message.nonce,
                        embeds: message.embeds,
                        components: message.components,
                        files: message.files
                    };
                }

                if (reply !== undefined) {
                    opts.reply = {
                        messageReference: reply
                    };
                }

                let result = await ch.send(opts);

                msg.payload = Flatted.parse(Flatted.stringify(result));

                send(msg);

                this.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'sent ' + result.id
                });

                done();
            } catch (err) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'error'
                });
                done(err);
            }
        });
    }
    RED.nodes.registerType('discord.send', DiscordSendNode);
};
