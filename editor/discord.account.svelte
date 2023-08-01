<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            category: 'discord general',
            color: nodeColor,
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
                destType: {
                    value: 'msg',
                    required: true,
                    types: ['msg', 'flow', 'global'],
                    validate: RED.validators.typedInput('destType')
                },
                destination: {
                    value: 'payload',
                    required: true
                }
            },
            label: function () {
                return this.name || 'Current Account';
            },
            paletteLabel: 'Current Account',
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
    }
</script>

<script>
    import { Input, TypedInput } from 'svelte-integration-red/components';
    import { nodeColor } from './lib/constants';

    export let node;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input bind:node prop="client" type="config" label="Client" bind:disabled={node.useMsg} />
<Input bind:node prop="useMsg" label="Same client as input Message" />

<TypedInput
    bind:node
    prop="destination"
    label="Set To"
    typeProp="destType"
    types={['msg', 'flow', 'global']}
/>
