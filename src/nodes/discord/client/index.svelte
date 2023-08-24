<script context="module" lang="ts">
    export const register = createRegister(__NODE_NAME__, {
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
                    permissions: 0,
                    commands: false
                }
            },
            _version: {
                value: version
            }
        },
        credentials: {
            token: { type: 'text' }
        },
        label: function () {
            return this.name || 'Client';
        },
        paletteLabel: 'Client'
    });

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

<script lang="ts">
    import InviteBotTray from '$editor/tray/InviteBotTray.svelte';
    import { fetch } from '$editor/lib/fetch';
    import { Input, openTray } from '@eslym/rs4r/components';
    import type { EditorNodeInstance } from 'node-red';
    import { version } from '$package.json';
    import type { DiscordClientNodeDef } from '.';
    import { createRegister } from '$editor/lib/utils';

    export let node: EditorNodeInstance<
        DiscordClientNodeDef & { invites: { permissions: number; commands: boolean } }
    >;

    let applicationId: string | undefined = undefined;

    const openInvite = () => {
        openTray(InviteBotTray, {
            title: 'Invite Bot',
            props: {
                ...node.invites,
                applicationId
            },
            binding: {
                permissions: (v) => (node.invites.permissions = v),
                commands: (v) => (node.invites.commands = v)
            },
            buttons: [
                {
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

<Input type="text" prop="name" label="Name" />
<Input type="password" prop="token" label="Token" />
