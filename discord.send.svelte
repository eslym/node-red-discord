<script context="module">
    import { noneType, builderType, clientNodeContextKey } from './components/shared.js';

    const messageTypes = ['msg', 'flow', 'global', 'env', 'str', 'json', 'jsonata', builderType];

    RED.nodes.registerType('discord.send', {
        category: 'discord',
        color: '#f2f3f5',
        icon: 'discord.png',
        defaults: {
            name: {
                value: '',
                required: false
            },
            useMsg: {
                value: false,
                type: 'bool'
            },
            client: {
                value: '',
                type: 'discord.client',
                required: false
            },
            channelSrc: {
                value: 'msg',
                required: true,
                types: ['msg', 'flow', 'global', 'env', 'str'],
                validate: RED.validators.typedInput('channelSrc')
            },
            channel: {
                value: 'payload.channelId',
                required: true
            },
            replySrc: {
                value: 'none',
                required: true,
                types: [noneType, 'msg', 'flow', 'global', 'env', 'str'],
                validate: RED.validators.typedInput('replySrc')
            },
            reply: {
                value: 'payload.id',
                required: false
            },
            messageSrc: {
                value: 'msg',
                required: true,
                types: messageTypes,
                validate: RED.validators.typedInput('messageSrc')
            },
            message: {
                value: 'payload.content',
                required: true
            },
            msg: {
                value: {},
                required: false
            }
        },
        label: function () {
            return this.name || 'Send';
        },
        paletteLabel: 'Send',
        inputs: 1,
        outputs: 1,
        oneditprepare: function () {
            render(this);
        },
        oneditsave: function () {
            update(this);
        },
        oneditcancel: function () {
            revert(this);
        }
    });
</script>

<script>
    import { Input, TypedInput } from 'svelte-integration-red/components';
    import MessageBuilder from './components/MessageBuilder.svelte';
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';

    export let node;

    let clientNode = writable(undefined);

    setContext(clientNodeContextKey, clientNode);

    $: $clientNode = node.client;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input bind:node prop="client" type="config" label="Client" bind:disabled={node.useMsg} />
<Input bind:node prop="useMsg" label="Same client as input Message" />
<TypedInput
    bind:node
    prop="channel"
    label="Channel ID"
    typeProp="channelSrc"
    types={['msg', 'flow', 'global', 'env', 'str']}
/>
<TypedInput
    bind:node
    prop="reply"
    label="Reply To"
    typeProp="replySrc"
    types={[noneType, 'msg', 'flow', 'global', 'env', 'str']}
/>
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
