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
    import { Icon, Input, Row, openTray, tooltip } from '@eslym/rs4r/components';
    import type { EditorNodeInstance } from 'node-red';
    import { version } from '$package.json';
    import type { DiscordClientNodeDef } from '.';
    import { createRegister } from '$editor/lib/utils';
    import MultiSelect from '$editor/components/MultiSelect.svelte';

    export let node: EditorNodeInstance<
        DiscordClientNodeDef & {
            invites: { permissions: number; commands: boolean };
        }
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
                permissions: (v?: number) => (node.invites.permissions = v!),
                commands: (v?: boolean) => (node.invites.commands = v!)
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
{#if applicationId}
    <Row>
        <label for={undefined} />
        <button
            use:tooltip={'Invite bot into your server'}
            type="button"
            class="red-ui-button red-ui-button-secondary"
            on:click={openInvite}
        >
            <Icon icon={{ fa4: 'plus' }} />
            Invite
        </button>
    </Row>
{/if}
<Row>
    <label for="dc-intents">Intents</label>
    <MultiSelect id="dc-intents" bind:value={node.intents} options={intents} />
</Row>
<Row>
    <label for={undefined} />
    <div class="rs4r-tags">
        {#each node.intents as intent, index (intent)}
            <div class="rs4r-tag">
                <span>{intent}</span>
                <button
                    type="button"
                    on:click={() =>
                        (node.intents = [
                            ...node.intents.slice(0, index),
                            ...node.intents.slice(index + 1)
                        ])}><Icon icon={{ fa4: 'times-circle' }} /></button
                >
            </div>
        {/each}
    </div>
</Row>
<Row>
    <label for="dc-partials">Partials</label>
    <MultiSelect id="dc-partials" bind:value={node.partials} options={partials} />
</Row>
<Row>
    <label for={undefined} />
    <div class="rs4r-tags">
        {#each node.partials as partials, index (partials)}
            <div class="rs4r-tag">
                <span>{partials}</span>
                <button
                    type="button"
                    on:click={() =>
                        (node.partials = [
                            ...node.partials.slice(0, index),
                            ...node.partials.slice(index + 1)
                        ])}><Icon icon={{ fa4: 'times-circle' }} /></button
                >
            </div>
        {/each}
    </div>
</Row>

<style lang="scss">
    .rs4r-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 2px 5px;
        font-size: 80%;
        width: min-content;
        flex-grow: 1;

        .rs4r-tag {
            display: flex;
            color: var(--red-ui-workspace-button-color);
            background-color: var(--red-ui-workspace-button-background);
            border: 1px solid var(--red-ui-form-input-border-color);
            padding: 2px 5px;
            border-radius: 3px;

            & > button {
                all: unset;
                margin-left: 5px;
                cursor: pointer;
            }
        }
    }
</style>
