import { promisify } from 'util';
import Mustache from 'mustache';
import Color from 'color';
import { ButtonStyle, ComponentType } from 'discord.js';
import { parseEmoji } from '$shared/emoji';

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {string} propType
 * @param {*} propVal
 * @param {import('node-red').NodeMessage} msg
 * @param {object} message
 * @returns {Promise<import('discord.js').MessageCreateOptions>|string}
 */
export async function evaluatePropOrMessage(RED, node, msg, propType, propVal, message) {
    if (propType === 'builder') {
        return evaluateMessage(RED, node, msg, message);
    }
    const prop = promisify(RED.util.evaluateNodeProperty);
    const m = await prop(propVal, propType, node, msg);
    if (propType === 'str') {
        return {
            content: Mustache.render(m, msg)
        };
    }
    if (typeof m === 'string') {
        return {
            content: m
        };
    }
    return {
        content: m.content,
        tts: m.tts,
        nonce: m.nonce,
        embeds: m.embeds,
        components: m.components,
        files: m.files
    };
}

/**
 * @param {import('node-red').NodeAPI} RED
 * @param {import('node-red').Node} node
 * @param {import('node-red').NodeMessage} msg
 * @param {object} message
 * @returns {Promise<import('discord.js').MessageCreateOptions>}
 */
export async function evaluateMessage(RED, node, msg, message) {
    let result = {};
    if (message.content) {
        result.content = Mustache.render(message.content, msg);
    }
    if (message.embeds && message.embeds.length) {
        result.embeds = await Promise.all(
            message.embeds.map((embed) => evaluateEmbed(RED, node, msg, embed))
        );
    }
    if (message.components && message.components.length) {
        result.components = await Promise.all(
            message.components.map(async (row) => ({
                type: ComponentType.ActionRow,
                components: await Promise.all(
                    row.map((component) => evaluateComponent(RED, node, msg, component))
                )
            }))
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
export async function evaluateEmbed(RED, node, msg, embed) {
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
    if (embed.timestamp && embed.timestamp.type !== 'undefined') {
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

export async function evaluateComponent(RED, node, msg, component) {
    const prop = promisify(RED.util.evaluateNodeProperty);
    const result = {
        type: component.type
    };
    if (component.disabled.type !== 'undefined') {
        result.disabled = boolVal(
            await prop(component.disabled.value, component.disabled.type, node, msg)
        );
    }
    if (component.type === ComponentType.Button) {
        result.label = Mustache.render(component.label, msg);
        result.style = component.style;
        if (component.emoji) {
            result.emoji = await evaluateEmoji(component.emoji);
        }
        if (component.style === ButtonStyle.Link) {
            result.url = Mustache.render(component.url, msg);
        } else {
            result.custom_id = Mustache.render(component.custom_id, msg);
        }
        return result;
    }
    if (component.placeholder) {
        result.placeholder = Mustache.render(component.placeholder, msg);
    }
    if (component.minLength !== 'undefined') {
        result.minLength = await prop(
            component.minLength.value,
            component.minLength.type,
            node,
            msg
        );
    }
    if (component.maxLength !== 'undefined') {
        result.maxLength = await prop(
            component.maxLength.value,
            component.maxLength.type,
            node,
            msg
        );
    }
    if (component.type === ComponentType.StringSelect) {
        result.options = await Promise.all(
            component.options.map((option) => evaluateOption(RED, node, msg, option))
        );
    } else if (
        component.type === ComponentType.ChannelSelect &&
        component.channel_types &&
        component.channel_types.length
    ) {
        result.channel_types = component.channel_types;
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
    if (image.width && image.width.type !== 'undefined') {
        result.width = await prop(image.width.value, image.width.type, node, msg);
    }
    if (image.height && image.height.type !== 'undefined') {
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

async function evaluateOption(RED, node, msg, option) {
    const prop = promisify(RED.util.evaluateNodeProperty);
    const result = {
        label: Mustache.render(option.label, msg),
        value: Mustache.render(option.value, msg)
    };
    if (option.description) {
        result.description = Mustache.render(option.description, msg);
    }
    if (option.emoji) {
        result.emoji = await evaluateEmoji(option.emoji);
    }
    if (option.default) {
        result.default = boolVal(await prop(option.default.value, option.default.type, node, msg));
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

async function evaluateEmoji(emoji) {
    switch (emoji.type) {
        case 'unicode':
            return {
                name: emoji.value
            };
        case 'guild':
            const e = parseEmoji(emoji.value);
            if (!e) {
                throw new Error(`Invalid emoji: ${emoji.value}`);
            }
            return e;
        default:
            return undefined;
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
