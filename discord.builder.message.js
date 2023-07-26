/**
 * @param {import('node-red').NodeAPI} RED
 */
module.exports = function (RED) {
    function DiscordMessageBuilderNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
    }
    RED.nodes.registerType('discord.builder.message', DiscordMessageBuilderNode);
};
