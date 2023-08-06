<script context="module">
    import { baseNodeDef } from '$editor/lib/constants';
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            ...baseNodeDef,
            category: 'discord interaction',
            defaults: {
                name: {
                    value: '',
                    required: false
                },
                ephemeral: {
                    value: false,
                    required: false
                },
                _version: {}
            },
            label: function () {
                return this.name || 'Defer Reply';
            },
            paletteLabel: 'Defer Reply',
            inputs: 1,
            outputs: 1,
            oneditprepare: function () {
                render(this);
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
    import { Input } from 'svelte-integration-red/components';
    export let node;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input bind:node prop="ephemeral" label="Ephemeral" type="checkbox" />
