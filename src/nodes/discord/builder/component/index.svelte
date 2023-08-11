<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            ...baseNodeDef,
            category: 'discord builder',
            defaults: {
                name: {
                    value: '',
                    requried: false
                },
                destType: {
                    value: 'msg',
                    required: true,
                    types: ['msg', 'flow', 'global']
                },
                destination: {
                    value: 'payload',
                    required: true
                },
                component: {
                    value: newRecord(),
                    required: true
                },
                _version: {}
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
                return update(this);
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
    } from '$editor/components/MessageComponentBuilder.svelte';
    import { baseNodeDef } from '$editor/lib/constants';

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
