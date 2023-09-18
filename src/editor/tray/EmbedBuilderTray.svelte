<script lang="ts">
    import EmbedBuilder from '$editor/components/builder/EmbedBuilder.svelte';
    import type { EmbedBuilderConfig } from '$shared/types';

    export let embed: EmbedBuilderConfig;
</script>

<EmbedBuilder bind:data={embed} deletable={false} expandable={false} />
