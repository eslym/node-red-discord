import { Events } from 'discord.js';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordFilterBotNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;

        this.on('input', (msg, send, done) => {
            try {
                const ctx = msg.$dc();
                let isBot;
                switch (ctx.event) {
                    case Events.MessageCreate:
                    case Events.MessageDelete:
                    case Events.MessageUpdate:
                        /** @type {import('discord.js').Message} */
                        const message = ctx.eventArgs[0];
                        isBot = message.author.bot;
                        break;
                    case Events.GuildMemberAdd:
                    case Events.GuildMemberAvailable:
                    case Events.GuildMemberUpdate:
                    case Events.UserUpdate:
                        /** @type {import('discord.js').GuildMember} */
                        const member = ctx.eventArgs[0];
                        isBot = member.user.bot;
                        break;
                    default:
                        this.status({
                            fill: 'red',
                            shape: 'dot',
                            text: 'not message event'
                        });
                        return done(new Error('Input is not from a discord message event'));
                }
                if (isBot) {
                    send([null, msg]);
                } else {
                    send([msg, null]);
                }
            } catch (err) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'error'
                });
                return done(err);
            }
        });
    }
    RED.nodes.registerType(__NODE_NAME__, DiscordFilterBotNode);
}
