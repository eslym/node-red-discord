import { Events, type ClientEvents } from 'discord.js';
import type { NodeAPI, Node, NodeDef } from 'node-red';
import type { DiscordClientNode } from '../client';
import { craftDiscordContext, hasTimeoutStatus, type HasTimeoutStatus } from '$lib/utils';
import { craftEventPayload } from '$lib/payload';

export interface DiscordListenNodeDef extends NodeDef {
    name: string;
    client: string;
    event: keyof ClientEvents;
    ignoreBot: boolean;
}

export interface DiscordListenNode extends Node<DiscordListenNodeDef>, HasTimeoutStatus {}

const isBot = new Map<keyof ClientEvents, (...args: any[]) => boolean>();

function registerBotIgnore<K extends keyof ClientEvents>(
    events: readonly K[],
    predicate: (a1: ClientEvents[K][0], a2: ClientEvents[K][1]) => boolean | undefined
) {
    for (const event of events) {
        isBot.set(event, predicate as any);
    }
}

registerBotIgnore(
    [Events.MessageCreate, Events.MessageDelete, Events.MessageUpdate],
    (m) => m.author?.bot
);

registerBotIgnore([Events.PresenceUpdate], (_, p) => p.user?.bot);

registerBotIgnore([Events.InteractionCreate, Events.TypingStart], (a) => a.user.bot);

registerBotIgnore(
    [
        Events.GuildMemberAdd,
        Events.GuildMemberAvailable,
        Events.GuildMemberRemove,
        Events.GuildMemberUpdate,
        Events.ThreadMemberUpdate
    ],
    (m) => m.user?.bot
);

registerBotIgnore([Events.GuildBanAdd, Events.GuildBanRemove], (b) => b.user.bot);

registerBotIgnore([Events.UserUpdate], (u) => u.bot);

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
            if (config.ignoreBot && isBot.has(config.event) && isBot.get(config.event)!(...args)) {
                return;
            }
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
