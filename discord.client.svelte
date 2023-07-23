<script context="module">
    RED.nodes.registerType('discord.client', {
        category: 'config',
        defaults: {
            name: {
                value: '',
                required: true
            },
            intents: {
                value: []
            },
            partials: {
                value: []
            }
        },
        credentials: {
            token: { type: 'text', label: 'Token' }
        },
        exportable: false,
        label: function () {
            return this.name || 'Client';
        },
        paletteLabel: 'Client',
        oneditprepare: function () {
            console.log('oneditprepare', this);
            render(this);
        },
        oneditsave: function () {
            console.log('oneditsave', this);
            update(this);
        },
        oneditcancel: function () {
            console.log('oneditcancel', this);
            revert(this);
        },
        onadd: function () {
            addCurrentNodeVersion(this);
        }
    });
</script>

<script>
    import { Input, ToggleGroup } from 'svelte-integration-red/components';

    export let node;

    $: console.log('node updated', node);

    const intents = [
        'Guilds',
        'GuildMembers',
        'GuildModeration',
        'GuildBans',
        'GuildEmojisAndStickers',
        'GuildIntegrations',
        'GuildWebhooks',
        'GuildInvites',
        'GuildVoiceStates',
        'GuildPresences',
        'GuildMessages',
        'GuildMessageReactions',
        'GuildMessageTyping',
        'DirectMessages',
        'DirectMessageReactions',
        'DirectMessageTyping',
        'MessageContent',
        'GuildScheduledEvents',
        'AutoModerationConfiguration',
        'AutoModerationExecution'
    ];
    const partials = [
        'User',
        'Channel',
        'GuildMember',
        'Message',
        'Reaction',
        'GuildScheduledEvent',
        'ThreadMember'
    ];
</script>

<Input bind:node type="text" prop="name" label="Name" />
<Input bind:node type="password" prop="token" label="Token" credentials />
<ToggleGroup bind:node prop="intents" options={intents} multiselect={true} label="Intents" />
<ToggleGroup bind:node prop="partials" options={partials} multiselect={true} label="Partials" />

<style>
    :global(.sir-Toggle-Group .content) {
        flex-wrap: wrap;
    }
</style>
