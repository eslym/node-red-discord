<script context="module">
    RED.nodes.registerType('discord.builder.embed', {
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
            embed: {
                value: {},
                required: true
            }
        },
        label: function () {
            return this.name || 'Embed Builder';
        },
        paletteLabel: 'Embed Builder',
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
    import EmbedBuilder from './components/EmbedBuilder.svelte';

    export let node;
</script>

<TypedInput
    bind:node
    prop="destination"
    label="Set To"
    typeProp="destType"
    types={['msg', 'flow', 'global']}
/>

<EmbedBuilder bind:node bind:embed={node.embed} />
