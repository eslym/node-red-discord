/**
 * @param {import('discord.js').Interaction} interaction
 */
export function mapInteraction(interaction) {
    let res = {
        $instance: () => interaction,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        message: interaction.message,
        member: interaction.member,
        user: interaction.user
    };
    if (interaction.isAnySelectMenu()) {
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
        res.type = 'button';
        res.customId = interaction.customId;
        return res;
    }
    if (interaction.isCommand()) {
        res.type = 'command';
        res.commandName = interaction.commandName;
        res.options = mapCommandOptions(interaction.options.data);
        if (interaction.isMessageContextMenuCommand()) {
            res.commandType = 'messageContextMenu';
        } else if (interaction.isUserContextMenuCommand()) {
            res.commandType = 'userContextMenu';
        } else if (interaction.isChatInputCommand) {
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

/**
 *
 * @param {import('discord.js').CommandInteractionOption[]} options
 */
function mapCommandOptions(options) {
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
