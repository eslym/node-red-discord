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
                replySrc: {
                    value: 'str',
                    required: true,
                    types: ['str', 'msg'],
                    validate: RED.validators.typedInput('replySrc')
                },
                reply: {
                    value: '@original'
                },
                messageSrc: {
                    value: 'msg',
                    required: true,
                    types: messageTypes
                },
                message: {
                    value: 'payload.content',
                    validate: RED.validators.typedInput('messageSrc')
                },
                msg: {
                    value: {},
                    required: false
                },
                _version: {}
            },
            label: function () {
                return this.name || 'Edit Interactin Reply Message';
            },
            paletteLabel: 'Edit Reply',
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

<TypedInput bind:node prop="reply" label="Message ID" typeProp="replySrc" types={['str', 'msg']} />

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
