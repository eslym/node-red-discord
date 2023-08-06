<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType(__NODE_NAME__, {
            ...baseNodeDef,
            category: 'discord general',
            defaults: {
                name: {
                    value: '',
                    required: false
                },
                outputs: {
                    value: 1
                },
                _version: {}
            },
            inputs: 1,
            outputs: 1,
            label: function () {
                return this.name || 'Ignore Bot';
            },
            paletteLabel: 'Ignore Bot',
            outputLabels: ['not bot', 'is bot'],
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
    import { baseNodeDef } from '$editor/lib/constants';
    export let node;

    let elseCase = node.outputs == 2;

    $: node.outputs = elseCase ? 2 : 1;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input type="checkbox" label="Output for else case" bind:value={elseCase} />
<p>
    Applicable events: <code>messageCreate</code>, <code>messageUpdate</code>,
    <code>messageDelete</code>,
    <code>guildMemberAdd</code>, <code>guildMemberAvailable</code>, <code>guildMemberUpdate</code>,
    <code>userUpdate</code>
</p>
