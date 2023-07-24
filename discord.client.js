const { Client } = require('discord.js');

/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    function DiscordClientNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.token = this.credentials.token;
        let client = new Client({
            intents: config.intents,
            partials: config.partials
        });
        this.discordClient = client;
        let timeout;
        const tryLogin = () => {
            client.login(this.token).catch((err) => {
                this.emit('failed', err);
                timeout = setTimeout(tryLogin, 5000);
            });
        };
        tryLogin();
        this.on('close', (_, done) => {
            client.destroy();
            clearTimeout(timeout);
            done();
        });
        this.discordEventListeners = new Map();
        this.discordListeners = new Map();
    }

    /**
     * @returns {Client}
     */
    DiscordClientNode.prototype.getDiscordClient = function () {
        return this.discordClient;
    };

    /**
     * @template {keyof import('discord.js').ClientEvents} K
     * @param {K} event
     * @param {keyof import('discord.js').ClientEvents[K]} listener
     */
    DiscordClientNode.prototype.onDiscord = function (event, listener) {
        if (!this.discordEventListeners.has(event)) {
            this.discordEventListeners.set(event, new Set());
        }
        this.discordEventListeners.get(event).add(listener);
        if (!this.discordListeners.has(event)) {
            let listener = (...args) => {
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

    /**
     * @param {string} event
     * @param {Function} listener
     */
    DiscordClientNode.prototype.offDiscord = function (event, listener) {
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

    RED.nodes.registerType('discord.client', DiscordClientNode, {
        credentials: {
            token: { type: 'text' }
        }
    });
};
