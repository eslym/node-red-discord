const Flatted = require('flatted');
const { setValue } = require('./lib/async.js');

/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    function DiscordAccountNode(config) {
        RED.nodes.createNode(this, config);

        if (!config.useMsg) {
            /** @type {DiscordClientNode} node */
            let node = RED.nodes.getNode(config.client);
            this.clientNode = node;
        }

        this.on('input', async (msg, send, done) => {
            try {
                /** @type {import('discord.js').Client} */
                let client = config.useMsg ? msg.$dc().client : this.clientNode.client;
                await setValue(
                    RED,
                    this,
                    msg,
                    config.destType,
                    config.destination,
                    Flatted.parse(Flatted.stringify(client.user))
                );
                send(msg);
                this.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'success'
                });
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
    RED.nodes.registerType('discord.account', DiscordAccountNode);
};
