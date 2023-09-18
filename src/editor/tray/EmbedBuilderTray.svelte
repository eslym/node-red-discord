<script lang="ts">
    import EmbedBuilder from '$editor/components/builder/EmbedBuilder.svelte';
    import type { EmbedBuilderConfig } from '$shared/types';

    export let embed: EmbedBuilderConfig;
</script>

<div>
    <EmbedBuilder bind:data={embed} deletable={false} expandable={false} />
</div>

<style>
    div {
        padding-bottom: 12px;
    }
</style>
