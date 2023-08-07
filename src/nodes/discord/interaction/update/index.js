import { Events } from 'discord.js';
import * as Flatted from 'flatted';
import { evaluatePropOrMessage } from '$lib/builder.js';
import { getReplies, mapInteraction } from '$lib/interaction';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordInteractionUpdateNode(config) {
        RED.nodes.createNode(this, config);

        this.on('input', async (msg, send, done) => {
            try {
                const ctx = msg.$dc();
                if (ctx.event !== Events.InteractionCreate) {
                    throw new Error('Input is not from a discord interaction event');
                }
                /** @type {import('discord.js').Interaction} */
                const interaction = ctx.eventArgs[0];

                const updateable =
                    interaction.isMessageComponent() ||
                    (interaction.isModalSubmit() && interaction.isFromMessage());

                if (!updateable) {
                    throw new Error('Interaction is not updateable');
                }

                const opts = await evaluatePropOrMessage(
                    RED,
                    this,
                    msg,
                    config.messageSrc,
                    config.message,
                    config.msg
                );

                const result = await interaction.update({
                    ...opts,
                    fetchReply: true
                });

                interaction.message = result;

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
    RED.nodes.registerType(__NODE_NAME__, DiscordInteractionUpdateNode);
}
