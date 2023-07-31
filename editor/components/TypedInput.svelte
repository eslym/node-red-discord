<script>
    import { TypedInput } from 'svelte-integration-red/components';

    export let data;

    let defaultData = {};

    export { defaultData as default };

    $: if (typeof data !== 'object') {
        data = defaultData;
    }
</script>

{#if typeof data === 'object'}
    <TypedInput
        bind:value={data.value}
        bind:type={data.type}
        {...$$restProps}
        on:click
        on:change
        on:mouseenter
        on:mouseleave
        on:click
        on:focus
        on:blur
    />
{/if}
