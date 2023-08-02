import { setValue } from '../lib/async';
import { evaluateMessage } from '../lib/builder';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordMessageBuilderNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.on('input', async (msg, send, done) => {
            try {
                let message = evaluateMessage(RED, this, msg, config.message);
                await setValue(RED, this, msg, config.destType, config.destination, message);
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        });
    }
    RED.nodes.registerType(__NODE_NAME__, DiscordMessageBuilderNode);
}
