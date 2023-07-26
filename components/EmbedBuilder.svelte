<script context="module">
    const undefinedType = {
        value: 'undefined',
        icon: 'fa-question',
        hasValue: false
    };
    const hbsType = {
        value: 'hbs',
        label: 'template',
        icon: 'fa-code',
        hasValue: true
    };
</script>

<script>
    import { Textarea, Collapsible, Input } from 'svelte-integration-red/components';

    export let embed;
    export let index;
</script>

<Collapsible label={embed.title || `Embed ${index + 1}`} collapsed>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <Input bind:value={embed.title} placeholder="Title" />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Description</label>
    <Textarea bind:value={embed.description} placeholder="Description" />
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>URL</label>
    <Input bind:value={embed.url} placeholder="URL" />
</Collapsible>
