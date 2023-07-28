<script context="module">
    export function register(render, update, revert) {
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
                render(this);
            },
            oneditsave: function () {
                update(this);
            },
            oneditcancel: function () {
                revert(this);
            },
            onadd: function () {
                addCurrentNodeVersion(this);
            }
        });
    }

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

<script>
    import { Input, ToggleGroup, Collapsible, Button } from 'svelte-integration-red/components';
    import InviteBotPopup from './components/InviteBotPopup.svelte';

    export let node;

    let applicationId = undefined;

    let invitePopup = false;

    (async () => {
        let res = await fetch(`/discord/${node.id}`);
        if (!res.ok) return;
        let data = await res.json();
        applicationId = data.applicationId;
    })();
</script>

<div>
    <Input bind:node type="text" prop="name" label="Name" />
    <Input bind:node type="password" prop="token" label="Token" credentials />
    {#if applicationId}
        <Button label="Invite Bot" on:click={() => (invitePopup = true)} />
        <InviteBotPopup bind:showPopup={invitePopup} bind:applicationId />
    {/if}
    <Collapsible collapsed label="Intents">
        <ToggleGroup
            bind:node
            prop="intents"
            options={intents}
            multiselect={true}
            showHeader={false}
            type="checkbox"
            flexDirection="column"
            inline={false}
        />
    </Collapsible>
    <Collapsible collapsed label="Partials">
        <ToggleGroup
            bind:node
            prop="partials"
            options={partials}
            multiselect={true}
            showHeader={false}
            type="checkbox"
            flexDirection="column"
            inline={false}
        />
    </Collapsible>
</div>
