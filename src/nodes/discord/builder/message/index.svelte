<script context="module">
    import icon from '$editor/icons/discord.png?red-icon';

    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            category: 'discord builder',
            color: nodeColor,
            icon: icon,
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
                    value: newRecord(),
                    required: true
                },
                _version: {}
            },
            label: function () {
                return this.name || 'Message Builder';
            },
            paletteLabel: 'Message Builder',
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
    import MessageBuilder, { newRecord } from '$editor/components/MessageBuilder.svelte';
    import { nodeColor } from '$editor/lib/constants';

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
