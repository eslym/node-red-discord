<script lang="ts">
    export let option: {
        value: string;
        label: string;
        description?: string;
    };
</script>

{#if option.description}
    <div>
        <span class="rs4r-bold">{option.label}</span>
        <span class="rs4r-description">{option.description}</span>
    </div>
{:else}
    {option.label}
{/if}

<style>
    .rs4r-bold {
        font-weight: bold;
        margin-bottom: 2px;
    }
    .rs4r-description {
        font-size: 0.8em;
        opacity: 0.75;
    }
</style>
