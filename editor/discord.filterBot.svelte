<script context="module">
    export function register(render, update, revert) {
        RED.nodes.registerType('discord.filterBot', {
            category: 'discord general',
            color: '#f2f3f5',
            defaults: {
                name: {
                    value: '',
                    required: false
                },
                outputs: {
                    value: 1
                }
            },
            inputs: 1,
            outputs: 1,
            icon: 'discord.png',
            label: function () {
                return this.name || 'Filter Bot Message';
            },
            paletteLabel: 'Filter Bot Message',
            outputLabels: ['not bot', 'is bot'],
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
    import { Input } from 'svelte-integration-red/components';
    export let node;

    let elseCase = node.outputs == 2;

    $: node.outputs = elseCase ? 2 : 1;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input type="checkbox" label="Output for bot message" bind:value={elseCase} />
<p>
    Applicable events: <code>messageCreate</code>, <code>messageUpdate</code>,
    <code>messageDelete</code>
</p>
