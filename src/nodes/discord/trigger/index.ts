import type { Node, NodeAPI, NodeDef, NodeMessage } from 'node-red';
import type { DiscordClientNode } from '../client';
import { Events, type Client } from 'discord.js';
import {
    craftDiscordContext,
    defineReadonlyProperty,
    hasTimeoutStatus,
    type HasTimeoutStatus
} from '$lib/utils';
import { craftEventPayload } from '$lib/payload';

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
        const ready = () => {
            this.status({ fill: 'green', shape: 'dot', text: 'ready' });
        };
        clientNode.discordClient.on('ready', ready);
        const failed = () => {
            this.status({ fill: 'red', shape: 'ring', text: 'failed' });
        };
        clientNode.on('failed', failed);
        this.on('close', (_: boolean, done: () => void) => {
            clientNode.discordClient.off('ready', ready);
            clientNode.off('failed', failed);
            done();
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
        msg.payload = craftEventPayload('ready', [this.discordClient]);
        sendFunc(msg);
        this.timeoutStatus({ fill: 'blue', shape: 'dot', text: 'triggered' }, 3000);
    };

    RED.nodes.registerType(__NODE_NAME__, DiscordTriggerNode);

    RED.httpAdmin.post(
        '/discord/:id/trigger',
        RED.auth.needsPermission('discord.trigger'),
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
