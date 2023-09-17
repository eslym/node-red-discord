<script lang="ts">
    export let tabs: string[];

    export let activeTab: string = tabs[0];
</script>

<div class="red-ui-tabs">
    <div>
        <ul>
            {#each tabs as tab (tab)}
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <li
                    class="red-ui-tab"
                    class:active={activeTab === tab}
                    on:click={() => (activeTab = tab)}
                >
                    {tab}
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    ul {
        display: flex;
    }
    li {
        flex-grow: 1;
        text-align: center;
        box-sizing: border-box;
        cursor: pointer;
    }
</style>
