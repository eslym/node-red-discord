import { setValue } from '$lib/async';
import { evaluateComponent } from '$lib/builder';

/**
 * @param {import('node-red').NodeAPI} RED
 */
export default function (RED) {
    function DiscordComponentBuilderNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.on('input', async (msg, send, done) => {
            try {
                let component = evaluateComponent(RED, this, msg, config.component);
                await setValue(RED, this, msg, config.destType, config.destination, component);
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        });
    }
    RED.nodes.registerType(__NODE_NAME__, DiscordComponentBuilderNode);
}
