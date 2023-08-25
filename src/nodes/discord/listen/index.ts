import type { ClientEvents } from 'discord.js';
import type { NodeAPI, Node, NodeDef } from 'node-red';
import type { DiscordClientNode } from '../client';
import { craftDiscordContext, hasTimeoutStatus, type HasTimeoutStatus } from '$lib/utils';
import { craftEventPayload } from '$lib/events';

export interface DiscordListenNodeDef extends NodeDef {
    name: string;
    client: string;
    event: keyof ClientEvents;
}

export interface DiscordListenNode extends Node<DiscordListenNodeDef>, HasTimeoutStatus {}

export default function (RED: NodeAPI) {
    function DiscordListenNode(this: DiscordListenNode, config: DiscordListenNodeDef) {
        RED.nodes.createNode(this, config);
        hasTimeoutStatus(this);
        const clientNode = RED.nodes.getNode(config.client) as DiscordClientNode;
        if (!clientNode) {
            this.error('No Discord client node configured');
        }
        if (!config.event) {
            this.error('No event selected');
        }
        const ready = () => {
            this.status({ fill: 'green', shape: 'dot', text: 'ready' });
        };
        clientNode.onDiscord('ready', ready);
        const listener = (...args: ClientEvents[keyof ClientEvents]) => {
            const context = craftDiscordContext(clientNode.discordClient, {
                event: config.event,
                args
            });
            const msg = {
                _msgid: RED.util.generateId(),
                $dc: context,
                topic: config.event,
                payload: craftEventPayload(config.event, args)
            };
            this.send(msg);
        };
        clientNode.onDiscord(config.event, listener);
        this.on('close', (_: boolean, done: () => void) => {
            clientNode.offDiscord('ready', ready);
            clientNode.offDiscord(config.event, listener);
            done();
        });
    }
    RED.nodes.registerType(__NODE_NAME__, DiscordListenNode);
}
