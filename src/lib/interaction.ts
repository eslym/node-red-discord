import type { CommandInteractionOption, Interaction } from 'discord.js';

const interactionReplies = new WeakMap();

export function mapInteraction(interaction: Interaction) {
    let res = {
        $instance: () => interaction,
        id: interaction.id,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        member: interaction.member,
        user: interaction.user
    } as any;
    if (interaction.isRepliable()) {
        res.replies = [...getReplies(interaction).values()];
    }
    if (interaction.isAnySelectMenu()) {
        res.message = interaction.message;
        res.type = 'select';
        if (interaction.isUserSelectMenu()) {
            res.selectType = 'user';
        } else if (interaction.isRoleSelectMenu()) {
            res.selectType = 'role';
        } else if (interaction.isChannelSelectMenu()) {
            res.selectType = 'channel';
        } else if (interaction.isMentionableSelectMenu()) {
            res.selectType = 'mentionable';
        } else if (interaction.isStringSelectMenu()) {
            res.selectType = 'string';
        }
        res.customId = interaction.customId;
        res.values = interaction.values;
        return res;
    }
    if (interaction.isButton()) {
        res.message = interaction.message;
        res.type = 'button';
        res.customId = interaction.customId;
        return res;
    }
    if (interaction.isCommand()) {
        res.type = 'command';
        res.commandName = interaction.commandName;
        res.options = mapCommandOptions(interaction.options.data);
        if (interaction.isMessageContextMenuCommand()) {
            res.targetMessage = interaction.targetMessage;
            res.commandType = 'messageContextMenu';
        } else if (interaction.isUserContextMenuCommand()) {
            res.commandType = 'userContextMenu';
        } else if (interaction.isChatInputCommand()) {
            res.commandType = 'chatInput';
        }
        return res;
    }
    if (interaction.isModalSubmit()) {
        res.type = 'modal';
        res.message = interaction.message;
        res.customId = interaction.customId;
        res.values = Object.fromEntries(
            interaction.fields.fields.map((com) => [com.customId, com.value])
        );
        return res;
    }
    return res;
}

function mapCommandOptions(options: readonly CommandInteractionOption[]) {
    return Object.fromEntries(
        options.map((option) => {
            let o = {
                name: option.name,
                value: option.value,
                user: option.user,
                channel: option.channel,
                role: option.role,
                member: option.member,
                attachment: option.attachment,
                type: [
                    null,
                    'subCommand',
                    'subCommandGroup',
                    'string',
                    'integer',
                    'boolean',
                    'user',
                    'channel',
                    'role',
                    'mentionable',
                    'number',
                    'attachment'
                ][option.type]
            };
            return [option.name, o];
        })
    );
}

export function getReplies(interaction: Interaction) {
    if (!interactionReplies.has(interaction)) {
        interactionReplies.set(interaction, new Map());
    }
    return interactionReplies.get(interaction);
}
