const Flatted = require('flatted');
const { asyncContext } = require('./async.js');

/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    function DiscordAccountNode(config) {
        RED.nodes.createNode(this, config);
        /**@type {(msg: NodeMessageInFlow, data) => Promise<void> | void} */
        let botUserSetter;
        switch (config.destType) {
            case 'msg':
                botUserSetter = (msg, data) => {
                    let paths = RED.util.normalisePropertyExpression(config.destination).join('.');
                    RED.util.setMessageProperty(msg, paths, data, true);
                };
                break;
            case 'flow':
            case 'global':
                let context = asyncContext(this.context()[config.desttype]);
                let key = RED.util.parseContextStore(config.destination);
                botUserSetter = (msg, data) => context.set(key.key, data, key.store);
                break;
            default:
                botUserSetter = () => {
                    throw new Error('Invalid Destination');
                };
        }

        if (!config.useMsg) {
            /** @type {DiscordClientNode} node */
            let node = RED.nodes.getNode(config.client);
            this.clientNode = node;
        }

        this.on('input', async (msg, send, done) => {
            try {
                /** @type {import('discord.js').Client} */
                let client = config.useMsg ? msg.$dc().client : this.clientNode.client;
                botUserSetter(msg, Flatted.parse(Flatted.stringify(client.user)));
                this.send(msg);
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
