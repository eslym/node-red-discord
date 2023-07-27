const { setValue } = require('./lib/async');
const { evaluateEmbed } = require('./lib/builder');

/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    function DiscordEmbedBuilderNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.on('input', async (msg, send, done) => {
            try {
                let embed = evaluateEmbed(RED, this, msg, config.embed);
                await setValue(RED, this, msg, config.destType, config.destination, embed);
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        });
    }
    RED.nodes.registerType('discord.builder.embed', DiscordEmbedBuilderNode);
};
