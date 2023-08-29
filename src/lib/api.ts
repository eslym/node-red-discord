import type { NextFunction, Request, Response } from 'express';
import type { NodeAPI } from 'node-red';
import type {
    AnyThreadChannel,
    Channel,
    Client,
    DMChannel,
    PartialDMChannel,
    PartialGroupDMChannel,
    TextBasedChannel
} from 'discord.js';
import type { DiscordClientNode } from 'src/nodes/discord/client';
import { stream, type Stream } from './generator';

export function declareAPI(RED: NodeAPI) {
    function getClient(
        req: Request,
        res: Response<any, { discordClient: Client }>,
        next: NextFunction
    ) {
        let node = RED.nodes.getNode(req.params.node) as DiscordClientNode;
        if (!node || node.type !== 'discord.client') {
            res.status(404).json('Client not found');
            return;
        }
        res.locals.discordClient = node.discordClient;
        if (!res.locals.discordClient.isReady()) {
            res.status(503).json('Client not ready');
            return;
        }
        next();
    }

    RED.httpAdmin.get(
        '/discord/:node',
        RED.auth.needsPermission('discord.read'),
        getClient,
        (req, res) => {
            let client = res.locals.discordClient;
            res.json({
                applicationId: client.application?.id
            });
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/guilds',
        RED.auth.needsPermission('discord.guilds.read'),
        getClient,
        (req, res) => {
            res.json(
                res.locals.discordClient.guilds.cache.map((guild) => {
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
            let guild = res.locals.discordClient.guilds.cache.get(req.params.guild);
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
            let client = res.locals.discordClient;
            let guild = client.guilds.cache.get(req.params.guild);
            if (!guild) {
                res.status(404).end();
                return;
            }
            let channels = guild.channels.cache;
            if (req.query.guild) {
                channels = channels.filter((channel) => {
                    return channel.guild.id === req.query.guild;
                });
            }
            if (req.query.text) {
                channels = channels.filter((channel) => {
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
            let guild = res.locals.discordClient.guilds.cache.get(req.params.guild);
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
        '/discord/:node/textChannels',
        RED.auth.needsPermission('discord.channels.read'),
        getClient,
        (req, res) => {
            let channels = stream(res.locals.discordClient.channels.cache.values()).filter(
                (ch) => ch.isTextBased() && !ch.isDMBased() && !ch.isThread()
            ) as Stream<
                Exclude<
                    TextBasedChannel,
                    DMChannel | PartialDMChannel | PartialGroupDMChannel | AnyThreadChannel
                >
            >;
            const query = req.query.q;
            if (typeof query === 'string') {
                channels = channels.filter((ch) => {
                    return (
                        ch.name.includes(query) ||
                        ch.id.includes(query) ||
                        ch.guild.name.includes(query)
                    );
                });
            }
            return res.json([
                ...channels.map((ch) => ({
                    id: ch.id,
                    name: ch.name,
                    type: ch.type,
                    guild: {
                        id: ch.guildId,
                        name: ch.guild.name,
                        thumbnail: ch.guild.iconURL({ size: 32, forceStatic: true })
                    }
                }))
            ]);
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/:guild/roles',
        RED.auth.needsPermission('discord.roles.read'),
        getClient,
        (req, res) => {
            let guild = res.locals.discordClient.guilds.cache.get(req.params.guild);
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
            let guild = res.locals.discordClient.guilds.cache.get(req.params.guild);
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
            let client = res.locals.discordClient;
            let guilds = [...client.guilds.cache.entries()]
                .map(([_, guild]) => {
                    let emojis = [...guild.emojis.cache.entries()].map(([_, emoji]) => ({
                        id: emoji.id,
                        name: emoji.name,
                        url: emoji.url,
                        animated: emoji.animated
                    }));
                    return [
                        guild.id,
                        {
                            id: guild.id,
                            name: guild.name,
                            thumbnail: guild.iconURL({ size: 32, forceStatic: true }),
                            emojis
                        }
                    ] as const;
                })
                .filter((g) => g[1].emojis.length > 0);
            res.json(Object.fromEntries(guilds));
        }
    );

    RED.httpAdmin.get(
        '/discord/:node/emojis/:emoji',
        RED.auth.needsPermission('discord.emojis.read'),
        getClient,
        (req, res) => {
            let emoji = res.locals.discordClient.emojis.cache.get(req.params.emoji);
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
