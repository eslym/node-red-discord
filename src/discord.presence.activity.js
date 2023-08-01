import { promisify } from 'util';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordPresenceActivityNode(config) {
        const prop = promisify(RED.util.evaluateNodeProperty);
        RED.nodes.createNode(this, config);

        if (!config.useMsg) {
            if (!config.client) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'no client'
                });
                return;
            }
            /** @type {DiscordClientNode} node */
            let node = RED.nodes.getNode(config.client);
            this.clientNode = node;
        }

        this.on('input', async (msg, send, done) => {
            try {
                /** @type {import('discord.js').Client} */
                let client = config.useMsg ? msg.$dc().client : this.clientNode.discordClient;
                let activity = {
                    name: await prop(config.activityName, config.activityNameSrc, this, msg),
                    type: await prop(config.activityType, config.activityTypeSrc, this, msg)
                };
                if (config.activityUrlSrc !== 'none') {
                    activity.url = await prop(config.activityUrl, config.activityUrlSrc, this, msg);
                }
                await client.user.setActivity(activity);
                send(msg);
                this.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'success'
                });
                done();
            } catch (err) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'error'
                });
                done(err);
            }
        });
    }
    RED.nodes.registerType(__NODE_NAME__, DiscordPresenceActivityNode);
}
