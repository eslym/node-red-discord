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
                _version: {}
            },
            label: function () {
                return this.name || 'Defer Update';
            },
            paletteLabel: 'Defer Update',
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
