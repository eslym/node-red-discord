const dcjs = require('discord.js');
const Flatted = require('flatted');

/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    function DiscordEventNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.event = config.event;
        /** @type {import('./types').DiscordClientNode} node */
        let node = RED.nodes.getNode(config.client);
        this.clientNode = node;
        let readyHandler = () => {
            this.status({
                fill: 'green',
                shape: 'dot',
                text: 'ready'
            });
        };
        let failedHandler = () => {
            this.status({
                fill: 'red',
                shape: 'dot',
                text: 'failed'
            });
        };
        let eventHandler = (...args) => {
            if (args.leng == 0) args = null;
            else if (args.length == 1) {
                args = args[0];
            }
            let msg = {
                _msgid: RED.util.generateId(),
                $dc: () => ({
                    $lib: dcjs,
                    client: this.clientNode.getDiscordClient()
                }),
                topic: config.event,
                payload: Flatted.parse(Flatted.stringify(args))
            };
            this.send(msg);
        };

        node.on('failed', failedHandler);
        node.onDiscord('ready', readyHandler);
        if (this.event !== undefined) {
            node.onDiscord(this.event, eventHandler);
        }

        this.on('close', (_, done) => {
            node.off('failed', failedHandler);
            node.offDiscord('ready', readyHandler);
            if (this.event !== undefined) {
                node.offDiscord(this.event, eventHandler);
            }
            done();
        });
    }
    RED.nodes.registerType('discord.event', DiscordEventNode);
};
