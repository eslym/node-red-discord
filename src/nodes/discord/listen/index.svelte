<script lang="ts" context="module">
    import { createRegister } from '$editor/lib/utils';
    import { Input } from '@eslym/rs4r/components';
    import type { DiscordListenNodeDef } from '.';
    import type { EditorNodeInstance } from 'node-red';
    import type { ClientEvents } from 'discord.js';

    export const register = createRegister(__NODE_NAME__, {
        category: 'discord',
        defaults: {
            name: {
                value: ''
            },
            client: {
                value: '',
                type: 'discord.client',
                required: true
            },
            event: {
                value: '',
                required: true
            },
            ignoreBot: {
                value: false
            }
        },
        paletteLabel() {
            if (this.event) return `On ${eventMap[this.event]}`;
            return 'Listen';
        },
        outputs: 1
    });

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
    } as Record<string, Record<string, string>>;

    const eventMap = Object.fromEntries(
        Object.entries(events)
            .map(([_, v]) => Object.entries(v))
            .flat(1)
    );

    const canIgnoreBot = new Set<keyof ClientEvents>([
        'messageCreate',
        'messageDelete',
        'messageUpdate',
        'presenceUpdate',
        'interactionCreate',
        'guildMemberAdd',
        'guildMemberAvailable',
        'guildMemberRemove',
        'guildMemberUpdate',
        'guildBanAdd',
        'guildBanRemove',
        'threadMemberUpdate',
        'userUpdate',
        'typingStart'
    ]);
</script>

<script lang="ts">
    export let node: EditorNodeInstance<DiscordListenNodeDef>;
</script>

<Input prop="name" label="Name" />
<Input prop="client" label="Client" />
<Input prop="event" label="Events" type="select">
    {#each Object.keys(events) as group}
        <optgroup label={group}>
            {#each Object.entries(events[group]) as option}
                <option value={option[0]}>{option[1]}</option>
            {/each}
        </optgroup>
    {/each}
</Input>
{#if canIgnoreBot.has(node.event)}
    <Input prop="ignoreBot" label="Ignore Bot" type="checkbox" />
{/if}
