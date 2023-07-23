<script context="module">
    RED.nodes.registerType('discord.event', {
        category: 'discord',
        color: '#7289da',
        defaults: {
            name: {
                value: '',
                required: false
            },
            client: {
                value: '',
                required: true,
                type: 'discord.client'
            },
            event: {
                value: '',
                required: true
            }
        },
        inputs: 0,
        outputs: 1,
        icon: 'discord.png',
        label: function () {
            return this.name || 'Listen ' + this.event || 'Listen';
        },
        paletteLabel: 'Listen',
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
    import { Input } from 'svelte-integration-red/components';

    export let node;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input bind:node prop="client" label="Client" type="config" />
