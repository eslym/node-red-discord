import { Events } from 'discord.js';
import * as Flatted from 'flatted';
import { promisify } from 'util';
import { evaluateMessage } from '$lib/builder.js';
import Mustache from 'mustache';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    const prop = promisify(RED.util.evaluateNodeProperty);

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

                let message;

                if (config.messageSrc === 'builder') {
                    message = await evaluateMessage(RED, this, msg, config.msg);
                } else {
                    message = await prop(config.message, config.messageSrc, this, msg);
                    if (config.messageSrc === 'str') {
                        message = Mustache.render(message, msg);
                    }
                }

                /** @type {import('discord.js').MessageCreateOptions} */
                let opts = {};

                if (typeof message === 'string') {
                    opts.content = message;
                } else if (typeof message === 'object') {
                    opts = {
                        content: message.content,
                        tts: message.tts,
                        nonce: message.nonce,
                        embeds: message.embeds,
                        components: message.components,
                        files: message.files
                    };
                }

                const result = await interaction.reply({
                    ...opts,
                    ephemeral: config.ephemeral,
                    fetchReply: true
                });

                msg.payload = Flatted.parse(Flatted.stringify(result));

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
