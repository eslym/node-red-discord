<script>
    import { writable } from 'svelte/store';
    import { Popup, Select } from 'svelte-integration-red/components';
    import { closePopup } from 'svelte-integration-red/components/Popup.svelte';
    import { getContext, createEventDispatcher } from 'svelte';
    import { clientNodeContextKey } from './shared';
    import SearchEmoji from './SearchEmoji.svelte';

    const dispatch = createEventDispatcher();

    export let showPopup = false;

    let _node = getContext(clientNodeContextKey);

    let _clientNode = _node ?? writable(undefined);
    let localClient = '';
    let popupId;

    async function checkAvailable(node) {
        if (!_node || !node) {
            return false;
        }
        let res = await fetch(`/discord/${node}`);
        return res.ok;
    }

    async function fetchAvailable() {
        let res = await fetch(`/discord/nodes`);
        if (!res.ok) return [];
        let nodes = await res.json();
        if (nodes.length) {
            localClient = nodes[0].id;
        }
        return nodes;
    }

    function onSelect(e) {
        closePopup(popupId);
        dispatch('select', e.detail);
    }
</script>

<Popup bind:id={popupId} modal fixed bind:showPopup>
    {#await checkAvailable($_clientNode) then ok}
        {#if ok}
            <SearchEmoji clientNode={$_clientNode} on:select={onSelect} />
        {:else}
            {#await fetchAvailable() then nodes}
                <Select label="Search from" bind:value={localClient}>
                    {#each nodes as node}
                        <option value={node.id}>{node.name || node.id}</option>
                    {/each}
                </Select>
                <SearchEmoji bind:clientNode={localClient} on:select={onSelect} />
            {/await}
        {/if}
    {/await}
</Popup>
