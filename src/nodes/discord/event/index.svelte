<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            ...baseNodeDef,
            category: 'discord general',
            defaults: {
                name: {
                    value: '',
                    required: false
                },
                client: {
                    value: '',
                    required: true,
                    type: 'discord.client'
                },
                event: {
                    value: undefined,
                    required: true
                },
                _version: {}
            },
            inputs: 0,
            outputs: 1,
            label: function () {
                return this.name || (this.event ? `On ${map[this.event]}` : 'Event');
            },
            paletteLabel: 'Event',
            oneditprepare: function () {
                render(this);
            },
            oneditsave: function () {
                return update(this);
            },
            oneditcancel: function () {
                revert(this);
            }
        });
    }

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

    const map = Object.fromEntries(
        Object.values(events)
            .map((c) => Object.entries(c))
            .flat()
    );
</script>

<script>
    import { baseNodeDef } from '$editor/lib/constants';
    import Input from '$editor/red/Input.svelte';
</script>

<Input prop="name" label="Name" type="text" />
<Input prop="client" label="Client" />

<Input prop="event" label="Event" type="select">
    <option value={undefined} style="display: none;">Select an event</option>
    {#each Object.keys(events) as category}
        <optgroup label={category}>
            {#each Object.keys(events[category]) as event}
                <option value={event}>{events[category][event]}</option>
            {/each}
        </optgroup>
    {/each}
</Input>
