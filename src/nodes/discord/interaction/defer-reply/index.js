import { getReplies, mapInteraction } from '$lib/interaction';
import { Events } from 'discord.js';
import * as Flatted from 'flatted';

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
                if (!interaction.isRepliable()) {
                    throw new Error('Interaction is not repliable');
                }
                const reply = await interaction.deferReply({
                    ephemeral: config.ephemeral,
                    fetchReply: true
                });
                getReplies(interaction).push(reply);
                msg.payload = Flatted.parse(Flatted.stringify(mapInteraction(reply)));
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
