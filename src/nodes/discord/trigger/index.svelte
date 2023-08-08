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
                client: {
                    value: '',
                    required: true,
                    type: 'discord.client'
                },
                inputs: {
                    value: 0
                },
                _version: {}
            },
            inputs: 0,
            outputs: 1,
            label: function () {
                return this.name || 'Trigger';
            },
            paletteLabel: 'Trigger',
            button: {
                visible() {
                    return true;
                },
                enabled() {
                    return !this.changed && this.client;
                },
                onclick() {
                    if (this.changed) {
                        return RED.notify(
                            RED._('notification.warning', {
                                message: RED._('notification.warnings.undeployedChanges')
                            }),
                            'warning'
                        );
                    }
                    fetchWithCreds(`/discord/${this.id}/trigger`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({})
                    });
                }
            },
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
    import { fetchWithCreds } from '$editor/lib/fetch';

    export let node;

    let input = node.inputs === 1;

    $: node.inputs = input ? 1 : 0;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input bind:node prop="client" label="Client" type="config" />
<Input label="Trigger by input" type="checkbox" bind:value={input} />
