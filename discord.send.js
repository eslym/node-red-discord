const Flatted = require('flatted');
const { promisify } = require('util');

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
            /** @type {DiscordClientNode} node */
            let node = RED.nodes.getNode(config.client);
            this.clientNode = node;
        }

        this.on('input', async (msg, send, done) => {
            let channel = await prop(config.channel, config.channelSrc, this, msg);
            let message = await prop(config.message, config.messageSrc, this, msg);

            /** @type {import('discord.js').Client} */
            let client = config.useMsg ? msg.$dc().client : this.clientNode.client;

            try {
                let ch = await client.channels.fetch(channel);

                if (!ch.isTextBased()) {
                    throw new Error('channel is not a text based channel');
                }

                let result = await ch.send(message);

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
