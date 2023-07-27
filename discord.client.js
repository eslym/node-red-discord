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

    function getClient(req, res, next) {
        let node = RED.nodes.getNode(req.params.node);
        if (!node || node.type !== 'discord.client') {
            res.status(404).json('Client not found');
            return;
        }
        req.discordClient = node.getDiscordClient();
        if (!req.discordClient.isReady()) {
            res.status(503).json('Client not ready');
            return;
        }
        next();
    }

    RED.httpAdmin.get('/discord/nodes', RED.auth.needsPermission('discord.read'), (req, res) => {
        let nodes = [];
        RED.nodes.eachNode((node) => {
            if (node.type === 'discord.client') {
                nodes.push({
                    id: node.id,
                    name: node.name
                });
            }
        });
        res.json(nodes);
    });

    RED.httpAdmin.get(
        '/discord/:node/available',
        RED.auth.needsPermission('discord.read'),
        getClient,
        (req, res) => {
            res.json('ok');
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/guilds',
        RED.auth.needsPermission('discord.guilds.read'),
        getClient,
        (req, res) => {
            res.json(
                req.discordClient.guilds.cache.map((guild) => {
                    return {
                        id: guild.id,
                        name: guild.name
                    };
                })
            );
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/guilds/:guild',
        RED.auth.needsPermission('discord.guilds.read'),
        getClient,
        (req, res) => {
            let guild = req.discordClient.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            res.json({
                id: guild.id,
                name: guild.name
            });
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/:guild/channels',
        RED.auth.needsPermission('discord.channels.read'),
        getClient,
        (req, res) => {
            /** @type {import('discord.js').Client} */
            let client = req.discordClient;
            let guild = client.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            let channels = guild.channels;
            if (req.query.guild) {
                channels = channels.cache.filter((channel) => {
                    return channel.guild.id === req.query.guild;
                });
            }
            if (req.query.text) {
                channels = channels.cache.filter((channel) => {
                    return channel.isTextBased();
                });
            }
            res.json(
                guild.channels.cache.map((channel) => {
                    return {
                        id: channel.id,
                        name: channel.name,
                        type: channel.type
                    };
                })
            );
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/:guild/channels/:channel',
        RED.auth.needsPermission('discord.channels.read'),
        getClient,
        (req, res) => {
            let guild = req.discordClient.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            let channel = guild.channels.cache.get(req.params.channel);
            if (!channel) {
                res.status(404).end();
                return;
            }
            res.json({
                id: channel.id,
                name: channel.name,
                type: channel.type
            });
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/:guild/roles',
        RED.auth.needsPermission('discord.roles.read'),
        getClient,
        (req, res) => {
            let guild = req.discordClient.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            res.json(
                guild.roles.cache.map((role) => {
                    return {
                        id: role.id,
                        name: role.name
                    };
                })
            );
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/:guild/roles/:role',
        RED.auth.needsPermission('discord.roles.read'),
        getClient,
        (req, res) => {
            let guild = req.discordClient.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            let role = guild.roles.cache.get(req.params.role);
            if (!role) {
                res.status(404).end();
                return;
            }
            res.json({
                id: role.id,
                name: role.name
            });
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/emojis',
        RED.auth.needsPermission('discord.emojis.read'),
        getClient,
        (req, res) => {
            /** @type {import('discord.js').Client} */
            let client = req.discordClient;
            let emojis = [...client.emojis.cache.entries()].map(([_, emoji]) => emoji);
            if (req.query.q) {
                emojis = emojis.filter(
                    (emoji) => emoji.name.includes(req.query.q) || emoji.id.includes(req.query.q)
                );
            }
            res.json(
                emojis.map((emoji) => ({
                    id: emoji.id,
                    name: emoji.name,
                    url: emoji.url,
                    animated: emoji.animated
                }))
            );
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/emojis/:emoji',
        RED.auth.needsPermission('discord.emojis.read'),
        getClient,
        (req, res) => {
            /** @type {import('discord.js').Emoji} */
            let emoji = req.discordClient.emojis.cache.get(req.params.emoji);
            if (!emoji) {
                res.status(404).json('Emoji not found');
                return;
            }
            res.json({
                id: emoji.id,
                name: emoji.name,
                url: emoji.url,
                animated: emoji.animated
            });
        }
    );
};
