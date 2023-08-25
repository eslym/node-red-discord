<script lang="ts">
    const events = {
        'Auto Moderation': {
            autoModerationActionExecution: 'Auto Moderation Action Execution',
            autoModerationRuleCreate: 'Auto Moderation Rule Create',
            autoModerationRuleDelete: 'Auto Moderation Rule Delete',
            autoModerationRuleUpdate: 'Auto Moderation Rule Update'
        },
        Guild: {
            guildAvailable: 'Guild Available',
            guildUnavailable: 'Guild Unavailable',
            guildUpdate: 'Guild Update',
            guildAuditLogEntryCreate: 'Guild Audit Log Entry Create',
            guildCreate: 'Guild Create',
            guildDelete: 'Guild Delete',
            guildBanAdd: 'Guild Ban Add',
            guildBanRemove: 'Guild Ban Remove',
            guildIntegrationsUpdate: 'Guild Integrations Update',
            roleAdd: 'Role Add',
            roleDelete: 'Role Delete',
            roleUpdate: 'Role Update',
            emojiCreate: 'Emoji Create',
            emojiDelete: 'Emoji Delete',
            emojiUpdate: 'Emoji Update',
            stickerCreate: 'Sticker Create',
            stickerDelete: 'Sticker Delete',
            stickerUpdate: 'Sticker Update'
        },
        'Guild Member': {
            guildMemberAdd: 'Guild Member Add',
            guildMemberAvailable: 'Guild Member Available',
            guildMemberRemove: 'Guild Member Remove',
            guildMembersChunk: 'Guild Members Chunk',
            guildMemberUpdate: 'Guild Member Update',
            userUpdate: 'User Update',
            presenceUpdate: 'Presence Update',
            voiceStateUpdate: 'Voice State Update'
        },
        'Guild Channel': {
            channelCreate: 'Channel Create',
            channelDelete: 'Channel Delete',
            channelPinsUpdate: 'Channel Pins Update',
            channelUpdate: 'Channel Update',
            inviteCreate: 'Invite Create',
            inviteDelete: 'Invite Delete',
            webhookUpdate: 'Webhook Update'
        },
        Message: {
            messageCreate: 'Message Create',
            messageDelete: 'Message Delete',
            messageUpdate: 'Message Update',
            messageDeleteBulk: 'Message Delete Bulk',
            messageReactionAdd: 'Message Reaction Add',
            messageReactionRemove: 'Message Reaction Remove',
            messageReactionRemoveAll: 'Message Reaction Remove All',
            messageReactionRemoveEmoji: 'Message Reaction Remove Emoji',
            typingStart: 'Typing Start'
        },
        Thread: {
            threadCreate: 'Thread Create',
            threadDelete: 'Thread Delete',
            threadListSync: 'Thread List Sync',
            threadMemberUpdate: 'Thread Member Update',
            threadMembersUpdate: 'Thread Member Leave',
            threadUpdate: 'Thread Update'
        },
        'Guild Event': {
            guildScheduledEventCreate: 'Guild Scheduled Event Create',
            guildScheduledEventDelete: 'Guild Scheduled Event Delete',
            guildScheduledEventUpdate: 'Guild Scheduled Event Update',
            guildScheduledEventUserAdd: 'Guild Scheduled Event User Add',
            guildScheduledEventUserRemove: 'Guild Scheduled Event User Remove'
        },
        Interaction: {
            interactionCreate: 'Interaction Create'
        },
        Client: {
            ready: 'Ready',
            error: 'Error',
            warn: 'Warning'
        }
    };
</script>
