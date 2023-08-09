<script>
    export let data;
    export let component;
</script>

<svelte:component this={component} bind:value={$data} />
