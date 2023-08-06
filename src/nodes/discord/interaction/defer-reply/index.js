import { Events } from 'discord.js';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordInteractionDeferReplyNode(config) {
        RED.nodes.createNode(this, config);

        this.on('input', async (msg, send, done) => {
            try {
                const ctx = msg.$dc();
                if (ctx.event !== Events.InteractionCreate) {
                    throw new Error('Input is not from a discord interaction event');
                }
                /** @type {import('discord.js').Interaction} */
                const interaction = ctx.eventArgs[0];
                await interaction.deferReply({
                    ephemeral: config.ephemeral
                });
                send(msg);
                done();
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
    RED.nodes.registerType(__NODE_NAME__, DiscordInteractionDeferReplyNode);
}
