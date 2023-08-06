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
                useMsg: {
                    value: false
                },
                client: {
                    value: '',
                    type: 'discord.client',
                    required: false
                },
                activityName: {
                    value: '',
                    required: true
                },
                activityNameSrc: {
                    value: 'str',
                    required: true
                },
                activityType: {
                    value: '0',
                    required: true
                },
                activityTypeSrc: {
                    value: 'num',
                    required: true
                },
                activityUrl: {
                    value: '',
                    required: false
                },
                activityUrlSrc: {
                    value: 'none',
                    required: true
                },
                _version: {}
            },
            inputs: 1,
            outputs: 1,
            label: function () {
                return this.name || 'Set Presence Activity';
            },
            paletteLabel: 'Set Presence Activity',
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
    import { baseNodeDef, noneType } from '$editor/lib/constants';
    import TypedInput from '$editor/components/TypedInput.svelte';
    export let node;
</script>

<Input bind:node prop="name" label="Name" type="text" />
<Input bind:node prop="client" type="config" label="Client" bind:disabled={node.useMsg} />
<Input bind:node prop="useMsg" label="Same client as input Message" />
<TypedInput
    bind:node
    prop="activityName"
    typeProp="activityNameSrc"
    types={['str', 'msg', 'flow', 'global', 'env']}
    label="Activity Name"
/>
<TypedInput
    bind:node
    prop="activityType"
    typeProp="activityTypeSrc"
    types={[
        {
            value: 'num',
            icon: 'fa-list',
            label: 'type',
            options: [
                { value: '0', label: 'Playing' },
                { value: '1', label: 'Streaming' },
                { value: '2', label: 'Listening' },
                { value: '3', label: 'Watching' },
                { value: '5', label: 'Competing' }
            ]
        },
        'msg',
        'flow',
        'global',
        'env'
    ]}
    label="Activity Type"
/>
<TypedInput
    bind:node
    prop="activityUrl"
    typeProp="activityUrlSrc"
    types={[noneType, 'str', 'msg', 'flow', 'global', 'env']}
    label="Activity URL"
/>
