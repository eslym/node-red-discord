<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
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
                },
                invites: {
                    value: {
                        permissions: '0',
                        commands: false
                    }
                },
                _version: {}
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
                return update(this);
            },
            oneditcancel: function () {
                revert(this);
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
    import InviteBotTray from '$editor/tray/InviteBotTray.svelte';
    import { fetchWithCreds as fetch } from '$editor/lib/fetch.js';
    import { openTray } from '@eslym/rs4r/tray';

    export let node;

    let applicationId = undefined;

    const openInvite = () => {
        if (!node.invites) {
            node.invites = {
                permissions: '0',
                commands: false
            };
        }
        openTray(InviteBotTray, {
            title: 'Invite Bot',
            value: applicationId,
            props: node.invites,
            binding: {
                permissions: (v) => (node.invites.permissions = v),
                commands: (v) => (node.invites.commands = v)
            },
            buttons: [
                {
                    id: 'node-dialog-back',
                    text: RED._('common.label.back'),
                    click() {
                        RED.tray.close();
                    }
                }
            ],
            width: '500px'
        });
    };

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
        <Button label="Invite Bot" on:click={openInvite} />
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
