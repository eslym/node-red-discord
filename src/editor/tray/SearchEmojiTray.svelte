<script>
    import { Select } from 'svelte-integration-red/components';
    import SearchEmoji from '$editor/components/SearchEmoji.svelte';

    export let value;
    export let clientNode;
    export let availableNodes = [];
    export let resolve;

    let localClient;

    if (availableNodes.length) {
        localClient = availableNodes[0].id;
    }

    function onSelect(e) {
        RED.tray.close();
        value = e.detail;
        resolve(e.detail);
    }
</script>

{#if clientNode}
    <SearchEmoji {clientNode} on:select={onSelect} />
{:else}
    <Select label="Search from" bind:value={localClient}>
        {#each availableNodes as node}
            <option value={node.id}>{node.name || node.id}</option>
        {/each}
    </Select>
    <SearchEmoji bind:clientNode={localClient} on:select={onSelect} />
{/if}
