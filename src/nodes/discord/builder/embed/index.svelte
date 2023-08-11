<script context="module">
    import icon from '$editor/icons/discord.png?red-icon';

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
                embed: {
                    value: {},
                    required: true
                },
                _version: {}
            },
            label: function () {
                return this.name || 'Embed Builder';
            },
            paletteLabel: 'Embed Builder',
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
    import EmbedBuilder from '$editor/components/EmbedBuilder.svelte';
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

<EmbedBuilder bind:node bind:embed={node.embed} />
