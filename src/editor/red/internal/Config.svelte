<script context="module">
    import { onDestroy, onMount } from 'svelte';
    import { writable } from 'svelte/store';

    const configNodes = {};

    RED.nodes.eachConfig((node) => {
        if (!(node.type in configNodes)) {
            configNodes[node.type] = new Set();
        }
        configNodes[node.type].add(node);
    });

    const configStore = writable(configNodes);

    RED.events.on('nodes:add', (node) => {
        if (node._def?.category !== 'config') {
            return;
        }
        if (!(node.type in configNodes)) {
            configNodes[node.type] = new Set();
        }
        configNodes[node.type].add(node);
        configStore.set(configNodes);
    });

    RED.events.on('nodes:change', (node) => {
        if (node._def?.category !== 'config') {
            return;
        }
        configStore.set(configNodes);
    });

    RED.events.on('nodes:remove', (node) => {
        if (node._def?.category !== 'config') {
            return;
        }
        if (!(node.type in configNodes)) {
            return;
        }
        configNodes[node.type].delete(node);
        if (configNodes[node.type].size === 0) {
            delete configNodes[node.type];
        }
        configStore.set(configNodes);
    });

    function checkType(type) {
        const def = RED.nodes.getType(type);
        return def?.category === 'config';
    }
</script>

<script>
    export let value;
    export let type;
    export let disabled;
    export let required;
    export let className;

    let onAdd, onRemove;

    function editNode() {
        const id = value ? '_ADD_' : value;
        RED.editor.editConfig('', type, id);
    }

    onMount(() => {
        onAdd = (node) => {
            if (value || node.type !== type) {
                return;
            }
            value = node.id;
        };
        onRemove = (node) => {
            if (value !== node.id) {
                return;
            }
            value = undefined;
        };
        RED.events.on('nodes:add', onAdd);
        RED.events.on('nodes:remove', onRemove);
    });

    onDestroy(() => {
        RED.events.off('nodes:add', onAdd);
        RED.events.off('nodes:remove', onRemove);
    });

    $: labelAdd = RED._('editor.addNewConfig', { type: RED.utils.sanitize(type) });

    $: if (!checkType(type)) throw new Error(`Invalid input type ${type}`);
</script>

<select bind:value {disabled} {required} class={className}>
    {#each $configStore[type] ?? [] as node (node.id)}
        <option value={node.id}>
            {typeof node.label === 'function' ? node.label() : node.name}
        </option>
        <option value={undefined}>{labelAdd}</option>
    {/each}
</select>
<button {disabled} on:click={editNode} class="red-ui-button"><i class="fa fa-pencil" /></button>
