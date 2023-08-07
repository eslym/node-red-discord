<script context="module">
    import { builderType, baseNodeDef } from '$editor/lib/constants.js';

    const messageTypes = ['msg', 'flow', 'global', 'env', 'str', 'json', 'jsonata', builderType];

    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            ...baseNodeDef,
            category: 'discord interaction',
            defaults: {
                name: {
                    value: '',
                    required: false
                },
                messageSrc: {
                    value: 'msg',
                    required: true,
                    types: messageTypes,
                    validate: RED.validators.typedInput('messageSrc')
                },
                message: {
                    value: 'payload.content'
                },
                msg: {
                    value: {},
                    required: false
                },
                ephemeral: {
                    value: false,
                    required: false
                },
                _version: {}
            },
            label: function () {
                return this.name || 'Follow Up Interaction';
            },
            paletteLabel: 'Follow Up',
            inputs: 1,
            outputs: 1,
            oneditprepare: function () {
                render(this, { minWidth: '500px' });
            },
            oneditsave: function () {
                return update(this);
            },
            oneditcancel: function () {
                revert(this);
            }
        });
    }
</script>

<script>
    import { Input, TypedInput } from 'svelte-integration-red/components';
    import MessageBuilder from '$editor/components/MessageBuilder.svelte';

    export let node;
</script>

<Input bind:node prop="name" label="Name" type="text" />

<Input bind:node prop="ephemeral" label="Ephemeral" type="checkbox" />

<TypedInput
    bind:node
    prop="message"
    label="Message"
    typeProp="messageSrc"
    types={messageTypes}
    on:change={(e) => {
        if (e.detail.type === 'builder') {
            node.msg = {
                content: e.detail.value,
                embeds: [],
                components: []
            };
        }
    }}
/>

{#if node.messageSrc === 'builder'}
    <MessageBuilder bind:msg={node.msg} />
{/if}
