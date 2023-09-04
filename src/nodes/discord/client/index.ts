import { Client, type Partials, type ClientEvents, type GatewayIntentsString } from 'discord.js';
import { declareAPI } from '$lib/api';
import type { NodeAPI, Node, NodeDef, NodeMessageInFlow, NodeMessage } from 'node-red';
import { defineReadonlyProperty } from '$lib/utils';

export interface DiscordClientNodeCreds {
    token: string;
}

export interface DiscordClientNodeDef extends NodeDef {
    name: string;
    intents: GatewayIntentsString[];
    partials: (keyof typeof Partials)[];
}

export interface DiscordClientNode extends Node<DiscordClientNodeCreds> {
    name: string;
    token: string;
    readonly discordClient: Client;
    discordEventListeners: Map<string, Set<Function>>;
    discordListeners: Map<string, Function>;
    onDiscord<K extends keyof ClientEvents>(
        event: K,
        listener: (...args: ClientEvents[K]) => void
    ): void;
    offDiscord(event: string, listener: Function): void;

    on(
        event: 'input',
        listener: (
            msg: NodeMessageInFlow,
            send: (msg: NodeMessage | Array<NodeMessage | NodeMessage[] | null>) => void,
            done: (err?: Error) => void
        ) => void
    ): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'close', listener: (done: () => void) => void): this;
    on(event: 'close', listener: (removed: boolean, done: () => void) => void): this;

    on(event: 'failed', listener: (error: Error) => void): this;
}

export default function (RED: NodeAPI) {
    function DiscordClientNode(this: DiscordClientNode, config: DiscordClientNodeDef) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.token = this.credentials.token;
        const client = new Client({
            intents: config.intents,
            partials: config.partials as any
        });
        defineReadonlyProperty(this, 'discordClient', client);
        let timeout: NodeJS.Timeout;
        const ready = () => {
            RED.events.emit('runtime-event', {
                id: 'discord/client/ready' + this.id,
                payload: {
                    applicationId: client.application?.id
                }
            });
        };
        client.on('ready', ready);
        const tryLogin = () => {
            client.login(this.token).catch((err) => {
                this.emit('failed', err);
                this.error('Failed to login to Discord: ' + err.message);
                timeout = setTimeout(tryLogin, 5000);
            });
        };
        tryLogin();
        this.on('close', (_: boolean, done: () => void) => {
            client.off('ready', ready);
            client.destroy();
            clearTimeout(timeout);
            done();
        });
        this.discordEventListeners = new Map();
        this.discordListeners = new Map();
    }

    DiscordClientNode.prototype.onDiscord = function (
        event: keyof ClientEvents,
        listener: (...args: any[]) => void
    ) {
        if (!this.discordEventListeners.has(event)) {
            this.discordEventListeners.set(event, new Set());
        }
        this.discordEventListeners.get(event).add(listener);
        if (!this.discordListeners.has(event)) {
            let listener = (...args: any[]) => {
                if (!this.discordEventListeners.has(event)) {
                    return;
                }
                let listeners = this.discordEventListeners.get(event);
                for (let listener of listeners) {
                    listener(...args);
                }
            };
            this.discordListeners.set(event, listener);
            this.discordClient.on(event, listener);
        }
    };

    DiscordClientNode.prototype.offDiscord = function (event: string, listener: Function) {
        if (!this.discordEventListeners.has(event)) {
            return;
        }
        let listeners = this.discordEventListeners.get(event);
        listeners.delete(listener);
        if (listeners.size === 0) {
            this.discordEventListeners.delete(event);
            this.discordClient.off(event, this.discordListeners.get(event));
            this.discordListeners.delete(event);
        }
    };

    RED.nodes.registerType(__NODE_NAME__, DiscordClientNode, {
        credentials: {
            token: { type: 'text' }
        }
    });

    declareAPI(RED);
}
