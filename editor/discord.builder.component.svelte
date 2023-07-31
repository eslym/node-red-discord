<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType('discord.builder.component', {
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
                component: {
                    value: newRecord(),
                    required: true
                }
            },
            label: function () {
                return this.name || 'Component Builder';
            },
            paletteLabel: 'Component Builder',
            inputs: 1,
            outputs: 1,
            oneditprepare: function () {
                render(this, { minWidth: '500px' });
            },
            oneditsave: function () {
                update(this);
            },
            oneditcancel: function () {
                revert(this);
            }
        });
    }
</script>

<script>
    import { TypedInput } from 'svelte-integration-red/components';
    import MessageComponentBuilder, {
        newRecord
    } from './components/MessageComponentBuilder.svelte';

    export let node;
</script>

<TypedInput
    bind:node
    prop="destination"
    label="Set To"
    typeProp="destType"
    types={['msg', 'flow', 'global']}
/>

<MessageComponentBuilder bind:component={node.component} />
