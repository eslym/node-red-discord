import type { Node, NodeAPI, NodeDef, NodeMessage } from 'node-red';
import type { DiscordClientNode } from '../client';
import { Events, type Client } from 'discord.js';
import {
    craftDiscordContext,
    craftReadyPayload,
    defineReadonlyProperty,
    hasTimeoutStatus,
    type HasTimeoutStatus
} from '$lib/utils';

export interface DiscordTriggerNodeDef extends NodeDef {
    client: string;
}

export interface DiscordTriggerNode extends Node<DiscordTriggerNodeDef>, HasTimeoutStatus {
    readonly discordClient: Client;
    triggerClientReady(msg: NodeMessage, sendFunc?: (msg: NodeMessage) => void): void;
}

export default function (RED: NodeAPI) {
    function DiscordTriggerNode(this: DiscordTriggerNode, config: DiscordTriggerNodeDef) {
        RED.nodes.createNode(this, config);
        hasTimeoutStatus(this);
        const clientNode = RED.nodes.getNode(config.client) as DiscordClientNode;
        if (!clientNode) {
            this.error('Missing Discord client configuration');
            return;
        }
        defineReadonlyProperty(this, 'discordClient', clientNode.discordClient);
        clientNode.discordClient.on('ready', () => {
            this.status({ fill: 'green', shape: 'dot', text: 'ready' });
        });
        this.on('input', (msg, send, done) => {
            this.triggerClientReady(msg, send);
            done();
        });
    }

    DiscordTriggerNode.prototype.triggerClientReady = function (
        this: DiscordTriggerNode,
        msg: NodeMessage,
        sendFunc?: (msg: NodeMessage) => void
    ) {
        if (!sendFunc) {
            sendFunc = this.send.bind(this);
        }
        if (!this.discordClient?.isReady?.()) {
            this.error('Discord client is not ready');
            this.status({ fill: 'red', shape: 'ring', text: 'not ready' });
        }
        (msg as any).$dc = craftDiscordContext(this.discordClient, {
            event: Events.ClientReady,
            args: [this.discordClient]
        });
        msg.topic = Events.ClientReady;
        msg.payload = craftReadyPayload(this.discordClient);
        sendFunc(msg);
        this.timeoutStatus({ fill: 'blue', shape: 'dot', text: 'triggered' }, 3000);
    };

    RED.nodes.registerType(__NODE_NAME__, DiscordTriggerNode);

    RED.httpAdmin.post(
        '/discord/:id/trigger',
        RED.auth.needsPermission('discord.write'),
        (req, res) => {
            const node = RED.nodes.getNode(req.params.id) as DiscordTriggerNode;
            if (!node || node.type !== __NODE_NAME__) {
                res.status(404).end();
                return;
            }
            node.triggerClientReady({
                _msgid: RED.util.generateId()
            });
            res.status(200).json('ok');
        }
    );
}
