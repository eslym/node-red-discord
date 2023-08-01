const messageEvents = new Set(['messageCreate', 'messageDelete', 'messageUpdate']);

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
                if (!messageEvents.has(ctx.event)) {
                    this.status({
                        fill: 'red',
                        shape: 'dot',
                        text: 'not message event'
                    });
                    return done(new Error('Input is not from a discord message event'));
                }
                /** @type {import('discord.js').Message} */
                const message = ctx.eventArgs[0];
                if (message.author.bot) {
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
