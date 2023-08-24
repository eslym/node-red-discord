<script context="module" lang="ts">
    import { fetch } from '$editor/lib/fetch';
    import { createRegister } from '$editor/lib/utils';
    import { version } from '$package.json';
    import { Input } from '@eslym/rs4r/components';
    import type { EditorNodeInstance } from 'node-red';

    export const register = createRegister(__NODE_NAME__, {
        category: 'discord',
        defaults: {
            name: {
                value: ''
            },
            client: {
                value: '',
                type: 'discord.client',
                required: true
            },
            inputs: {
                value: 0
            },
            _version: {
                value: version
            }
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
                return Boolean(!(this as any).changed && this.client);
            },
            onclick() {
                if ((this as any).changed) {
                    return RED.notify(
                        RED._('notification.warning', {
                            message: RED._('notification.warnings.undeployedChanges')
                        }),
                        'warning'
                    );
                }
                fetch(`/discord/${this.id}/trigger`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
            }
        }
    });
</script>

<script lang="ts">
    export let node: EditorNodeInstance;
</script>

<Input label="Name" prop="name" />
<Input label="Client" prop="client" />
<Input
    label="Trigger by input"
    on:change={() => (node.inputs = node.inputs ? 0 : 1)}
    type="checkbox"
    value={Boolean(node.inputs)}
/>
