import * as dcjs from 'discord.js';
import * as Flatted from 'flatted';
import { mapInteraction } from '$lib/interaction';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
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
            let context = Object.freeze({
                $lib: dcjs,
                client: this.clientNode.getDiscordClient(),
                event: this.event,
                eventArgs: Object.freeze([...args])
            });
            let msg = {
                _msgid: RED.util.generateId(),
                $dc: () => context,
                topic: config.event,
                payload: args
            };
            switch (this.event) {
                case 'ready':
                    msg.payload = args[0].readyTimestamp;
                    break;
                case 'interactionCreate':
                    msg.payload = Flatted.parse(Flatted.stringify(mapInteraction(args[0])));
                    break;
                default:
                    if (args.length == 0) args = undefined;
                    else if (args.length == 1) {
                        args = args[0];
                    }
                    msg.payload = Flatted.parse(Flatted.stringify(args));
                    break;
            }
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
    RED.nodes.registerType(__NODE_NAME__, DiscordEventNode);
}
