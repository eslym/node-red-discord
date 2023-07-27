const { promisify } = require('util');
const Mustache = require('mustache');
const Color = require('color');

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {import('node-red').NodeMessage} msg
 * @param {object} message
 * @returns {Promise<import('discord.js').MessageCreateOptions>}
 */
async function evaluateMessage(RED, node, msg, message) {
    let result = {};
    if (message.content) {
        result.content = Mustache.render(message.content, msg);
    }
    if (message.embeds && message.embeds.length) {
        result.embeds = await Promise.all(
            message.embeds.map((embed) => evaluateEmbed(RED, node, msg, embed))
        );
    }
    return result;
}

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {import('node-red').NodeMessage} msg
 * @param {object} embed
 * @returns {Promise<import('discord.js').EmbedData>}
 */
async function evaluateEmbed(RED, node, msg, embed) {
    const prop = promisify(RED.util.evaluateNodeProperty);
    const result = {};
    if (embed.title) {
        result.title = Mustache.render(embed.title, msg);
    }
    if (embed.description) {
        result.description = Mustache.render(embed.description, msg);
    }
    if (embed.url) {
        result.url = Mustache.render(embed.url, msg);
    }
    if (embed.color) {
        let color = Color(await prop(embed.color.value, embed.color.type, node, msg));
        embed.color = color.rgbNumber();
    }
    if (embed.image) {
        result.image = await evaluateImage(RED, node, msg, embed.image);
    }
    if (embed.thumbnail) {
        result.thumbnail = await evaluateImage(RED, node, msg, embed.thumbnail);
    }
    if (embed.fields && embed.fields.length) {
        result.fields = await Promise.all(
            embed.fields.map((field) => evaluateField(RED, node, msg, field))
        );
    }
    if (embed.timestamp) {
        result.timestamp = dateVal(
            await prop(embed.timestamp.value, embed.timestamp.type, node, msg)
        );
    }
    if (embed.author) {
        let author = {};
        if (embed.author.name) {
            author.name = Mustache.render(embed.author.name, msg);
        }
        if (embed.author.url) {
            author.url = Mustache.render(embed.author.url, msg);
        }
        if (embed.author.icon_url) {
            author.icon_url = Mustache.render(embed.author.icon_url, msg);
        }
        if (Object.keys(author).length) {
            result.author = author;
        }
    }
    if (embed.footer) {
        let footer = {};
        if (embed.footer.text) {
            footer.text = Mustache.render(embed.footer.text, msg);
        }
        if (embed.footer.icon_url) {
            footer.icon_url = Mustache.render(embed.footer.icon_url, msg);
        }
        if (Object.keys(footer).length) {
            result.footer = footer;
        }
    }
    return result;
}

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {import('node-red').NodeMessage} msg
 * @param {*} image
 * @returns {Promise<import('discord.js').EmbedImageData>}
 */
async function evaluateImage(RED, node, msg, image) {
    if (!image.url) {
        return undefined;
    }
    const prop = promisify(RED.util.evaluateNodeProperty);
    const result = {
        url: Mustache.render(image.url, msg)
    };
    if (image.width) {
        result.width = await prop(image.width.value, image.width.type, node, msg);
    }
    if (image.height) {
        result.height = await prop(image.height.value, image.height.type, node, msg);
    }
    return result;
}

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {import('node-red').NodeMessage} msg
 * @param {object} field
 * @returns {Promise<import('discord.js').EmbedField>}
 */
async function evaluateField(RED, node, msg, field) {
    const prop = promisify(RED.util.evaluateNodeProperty);
    const result = {};
    if (field.name) {
        result.name = Mustache.render(field.name, msg);
    }
    if (field.value) {
        result.value = Mustache.render(field.value, msg);
    }
    if (field.inline) {
        result.inline = boolVal(await prop(field.inline.value, field.inline.type, node, msg));
    }
    return result;
}

function boolVal(val) {
    switch (typeof val) {
        case 'string':
            val = val.toLowerCase();
            return val === 'true' || val === '1' || val === 'yes' || val === 'y' || val === 'on';
        case 'number':
            return val === 1;
        default:
            return !!val;
    }
}

function dateVal(val) {
    switch (typeof val) {
        case 'string':
            return new Date(val);
        case 'number':
            return new Date(val);
        default:
            throw new Error('Invalid Date');
    }
}

module.exports = { evaluateMessage, evaluateEmbed };
