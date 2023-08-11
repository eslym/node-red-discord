import * as dcjs from 'discord.js';
import * as Flatted from 'flatted';
import { mapInteraction } from '$lib/interaction';
import { craftDiscordContext, craftReadyPayload } from '$lib/utils';

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
            /** @type {import('discord.js').Client} */
            const client = this.clientNode.getDiscordClient();
            let context = craftDiscordContext(client, {
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
                case dcjs.Events.ClientReady:
                    msg.payload = craftReadyPayload(client);
                    break;
                case dcjs.Events.InteractionCreate:
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

        const restartHandler = () => {
            this.status({
                fill: 'blue',
                shape: 'ring',
                text: 'starting'
            });
        };

        this.clientNode.on('discord:start', restartHandler);

        this.on('close', (_, done) => {
            node.off('failed', failedHandler);
            this.clientNode.off('discord:start', restartHandler);
            node.offDiscord('ready', readyHandler);
            if (this.event !== undefined) {
                node.offDiscord(this.event, eventHandler);
            }
            done();
        });
    }

    RED.nodes.registerType(__NODE_NAME__, DiscordEventNode);
}
