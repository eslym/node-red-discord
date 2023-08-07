import { Events } from 'discord.js';
import * as Flatted from 'flatted';
import { evaluatePropOrMessage } from '$lib/builder.js';
import { getReplies, mapInteraction } from '$lib/interaction';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordInteractionReplyNode(config) {
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

                const opts = await evaluatePropOrMessage(
                    RED,
                    this,
                    msg,
                    config.messageSrc,
                    config.message,
                    config.msg
                );

                const result = await interaction.reply({
                    ...opts,
                    ephemeral: config.ephemeral,
                    fetchReply: true
                });

                getReplies(interaction).push(result);

                msg.payload = Flatted.parse(Flatted.stringify(mapInteraction(interaction)));

                send(msg);

                this.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'sent ' + result.id
                });

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
    RED.nodes.registerType(__NODE_NAME__, DiscordInteractionReplyNode);
}
