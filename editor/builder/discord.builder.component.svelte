<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            category: 'discord builder',
            color: nodeColor,
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
    } from '../components/MessageComponentBuilder.svelte';
    import { nodeColor } from '../lib/constants';

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
