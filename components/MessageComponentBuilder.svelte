<script>
    import { Input, Select } from 'svelte-integration-red/components';
    import TypedInput from './TypedInput.svelte';
    import EmojiInput from './EmojiInput.svelte';

    export let component;

    export let disableSelect = false;
</script>

<Select label="Type" bind:value={component.type}>
    <option value={2}>Button</option>
    <option value={3} disabled={disableSelect}>Select Menu</option>
    <option value={5} disabled={disableSelect}>User Select</option>
    <option value={6} disabled={disableSelect}>Role Select</option>
    <option value={7} disabled={disableSelect}>Mentionable Select</option>
    <option value={7} disabled={disableSelect}>Channel Select</option>
</Select>
{#if component.type === 2}
    {#if component.style === 5}
        <Input label="URL" placeholder="URL" bind:value={component.url} />
    {:else}
        <Input label="ID" placeholder="Custom ID" bind:value={component.custom_id} />
    {/if}
    <Select label="Style" bind:value={component.style}>
        <option value={1}>Primary</option>
        <option value={2}>Secondary</option>
        <option value={3}>Success</option>
        <option value={4}>Danger</option>
        <option value={5}>Link</option>
    </Select>
    <Input label="Label" placeholder="Label" bind:value={component.label} />
    <EmojiInput label="Emoji" bind:emoji={component.emoji} />
{/if}
<TypedInput
    label="Disabled"
    bind:data={component.disabled}
    default={{ type: 'bool', value: 'false' }}
    types={['bool', 'msg', 'flow', 'global', 'env']}
/>
