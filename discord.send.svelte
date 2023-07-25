<script context="module">
    const messageTypes = [
        'msg',
        'flow',
        'global',
        'env',
        'str',
        'json',
        'jsonata'
        // {
        //     value: 'builder',
        //     label: 'Message Builder',
        //     hasValue: false
        // }
    ];

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
                type: 'str',
                required: true
            },
            messageSrc: {
                value: 'msg',
                required: true,
                types: messageTypes,
                validate: RED.validators.typedInput('messageSrc')
            },
            message: {
                value: 'payload.content',
                type: 'str',
                required: true
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

    export let node;
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
<TypedInput bind:node prop="message" label="Message" typeProp="messageSrc" types={messageTypes} />
