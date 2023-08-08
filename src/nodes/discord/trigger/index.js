import { craftReadyPayload, craftDiscordContext } from '$lib/utils';
import { Events } from 'discord.js';

/**
 * @param {import("node-red").NodeAPI} RED
 */
export default function (RED) {
    function DiscordTriggerNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        const clientNode = RED.nodes.getNode(config.client);
        if (!clientNode) return;
        /** @type {import('discord.js').client} */
        this.client = clientNode.getDiscordClient();

        this.on('input', (msg, _, done) => {
            try {
                if (!this.client || !this.client.isReady()) {
                    throw new Error('Client is not ready');
                }
                const context = craftDiscordContext(this.client, {
                    event: Events.ClientReady,
                    eventArgs: [client]
                });
                msg.$dc = () => context;
                msg.topic = Events.ClientReady;
                msg.payload = craftReadyPayload(this.client);
                send(msg);
                this.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'triggered'
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

    RED.nodes.registerType(__NODE_NAME__, DiscordTriggerNode);

    RED.httpAdmin.post(
        '/discord/:id/trigger',
        RED.auth.needsPermission('discord.write'),
        (req, res) => {
            const node = RED.nodes.getNode(req.params.id);
            if (!node || node.type !== __NODE_NAME__ || !node.client) {
                res.status(404).json('Node not found');
                return;
            }
            /** @type {import('discord.js').Client} */
            const client = node.client;

            if (!client.isReady()) {
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'not ready'
                });
                res.status(400).json('Client is not ready');
                return;
            }

            const context = craftDiscordContext(client, {
                event: Events.ClientReady,
                eventArgs: [client]
            });

            const msg = {
                _msgid: RED.util.generateId(),
                $dc: () => context,
                topic: Events.ClientReady,
                payload: craftReadyPayload(client)
            };
            node.send(msg);
            node.status({
                fill: 'green',
                shape: 'dot',
                text: 'triggered'
            });
            res.status(200).json('ok');
        }
    );
}
