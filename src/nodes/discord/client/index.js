import { Client } from 'discord.js';
import { declareAPI } from '$lib/api';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordClientNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.token = this.credentials.token;
        let timeout;

        /** @type {Client} */
        let client = undefined;

        Object.defineProperty(this, 'discordClient', {
            get() {
                return client;
            },
            set(value) {}
        });

        this.getDiscordClient = () => client;

        let events = new Map();
        let listenerWrapper = new Map();

        this.onDiscord = (event, listener) => {
            if (!events.has(event)) {
                events.set(event, new Set());
            }
            events.get(event).add(listener);
            if (!listenerWrapper.has(event)) {
                const listener = (...args) => {
                    if (!events.has(event)) {
                        return;
                    }
                    let listeners = events.get(event);
                    for (let listener of listeners) {
                        listener(...args);
                    }
                };
                listenerWrapper.set(event, listener);
                client.on(event, listener);
            }
        };

        this.offDiscord = (event, listener) => {
            if (!events.has(event)) {
                return;
            }
            let listeners = events.get(event);
            listeners.delete(listener);
            if (listeners.size === 0) {
                events.delete(event);
                client.off(event, listenerWrapper.get(event));
                listenerWrapper.delete(event);
            }
        };

        this.restartClient = () => {
            this.emit('discord:start');
            clearTimeout(timeout);
            if (client !== undefined) {
                client.destroy();
            }
            client = new Client({
                intents: config.intents,
                partials: config.partials
            });
            const tryLogin = () => {
                client
                    .login(this.token)
                    .then(() => {
                        for (const [event, listener] of listenerWrapper) {
                            client.on(event, listener);
                        }
                    })
                    .catch((err) => {
                        this.emit('failed', err);
                        timeout = setTimeout(tryLogin, 5000);
                    });
            };
            tryLogin();
        };
        this.restartClient();
        this.on('close', (_, done) => {
            if (client !== undefined) {
                client.destroy();
            }
            clearTimeout(timeout);
            done();
        });
        events = new Map();
        listenerWrapper = new Map();
    }

    RED.nodes.registerType(__NODE_NAME__, DiscordClientNode, {
        credentials: {
            token: { type: 'text' }
        }
    });

    declareAPI(RED);
}
