<script context="module">
    RED.nodes.registerType('discord.builder.message', {
        category: 'discord builder',
        color: '#f2f3f5',
        icon: 'discord.png',
        defaults: {
            name: {
                value: '',
                requried: false
            },
            destType: {
                value: 'msg',
                required: true,
                types: ['msg', 'flow', 'global'],
                validate: RED.validators.typedInput('destType')
            },
            destination: {
                value: 'payload',
                required: true
            },
            message: {
                value: {},
                required: true
            }
        },
        label: function () {
            return this.name || 'Message Builder';
        },
        paletteLabel: 'Message Builder',
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
    import { TypedInput } from 'svelte-integration-red/components';
    import MessageBuilder from './components/MessageBuilder.svelte';

    export let node;
</script>

<TypedInput
    bind:node
    prop="destination"
    label="Set To"
    typeProp="destType"
    types={['msg', 'flow', 'global']}
/>

<MessageBuilder bind:node bind:msg={node.msg} />
