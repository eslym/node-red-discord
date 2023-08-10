<script>
    export let data;
    export let props = {};
    export let component;
</script>

<div>
    <svelte:component this={component} bind:value={$data} {...props} />
</div>

<style>
    div {
        padding: 1em;
        height: 100%;
    }
</style>
