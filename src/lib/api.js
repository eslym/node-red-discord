/**
 * @param {import('node-red').NodeAPI} RED
 */
export function declareAPI(RED) {
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
        '/discord/:node',
        RED.auth.needsPermission('discord.read'),
        getClient,
        (req, res) => {
            /** @type {import('discord.js').Client} */
            let client = req.discordClient;
            res.json({
                applicationId: client.application.id
            });
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
                        name: guild.name,
                        thumbnail: guild.iconURL({ size: 32, forceStatic: true })
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
            /** @type {import('discord.js').Guild} */
            let guild = req.discordClient.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            res.json({
                id: guild.id,
                name: guild.name,
                thumbnail: guild.iconURL({ size: 32, forceStatic: true })
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
            /** @type {import('discord.js').Guild} */
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
            /** @type {import('discord.js').Guild} */
            let guild = req.discordClient.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            res.json(
                guild.roles.cache.map((role) => {
                    return {
                        id: role.id,
                        name: role.name,
                        color: `#${role.color.toString(16).padStart(6, '0')}`
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
            /** @type {import('discord.js').Guild} */
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
                name: role.name,
                color: `#${role.color.toString(16).padStart(6, '0')}`
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
            let keyword = req.query.q ? req.query.q.toLowerCase() : null;
            let guilds = [...client.guilds.cache.entries()]
                .map(([_, guild]) => {
                    let emojis = [...guild.emojis.cache.entries()].map(([_, emoji]) => ({
                        id: emoji.id,
                        name: emoji.name,
                        url: emoji.url,
                        animated: emoji.animated
                    }));
                    if (keyword) {
                        emojis = emojis.filter((emoji) =>
                            emoji.name.toLowerCase().includes(keyword)
                        );
                    }
                    return {
                        id: guild.id,
                        name: guild.name,
                        thumbnail: guild.iconURL({ size: 32, forceStatic: true }),
                        emojis
                    };
                })
                .filter((g) => g.emojis.length > 0);
            res.json(guilds);
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
}