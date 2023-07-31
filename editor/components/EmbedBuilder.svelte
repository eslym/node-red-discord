<script>
    import { undefinedType } from '../lib/constants';
    import {
        Textarea,
        Collapsible,
        Input,
        Row,
        Button,
        EditableList
    } from 'svelte-integration-red/components';
    import TypedInput from './TypedInput.svelte';
    import FieldBuilder from './FieldBuilder.svelte';
    import ImageBuilder from './ImageBuilder.svelte';
    import EditList from './EditList.svelte';

    export let embed;
</script>

<Input label="Title" bind:value={embed.title} placeholder="Title" />
<!-- svelte-ignore a11y-label-has-associated-control -->
<label>Description</label>
<Textarea bind:value={embed.description} placeholder="Description" />
<Input label="URL" bind:value={embed.url} placeholder="URL" />
<Row>
    <TypedInput
        label="Color"
        bind:data={embed.color}
        inline
        default={{ type: 'str', value: '#000000' }}
        types={['str', 'msg', 'flow', 'global', 'env']}
    />
    {#if embed.color && embed.color.type === 'str' && /#([0-9a-f]{3}|[0-9a-f]{6})/i.test(embed.color.value)}
        <span class="color-indicator" style="background-color: {embed.color.value}" />
    {/if}
</Row>
<TypedInput
    label="Timestamp"
    bind:data={embed.timestamp}
    default={{ type: 'undefined', value: undefined }}
    types={[undefinedType, 'date', 'str', 'msg', 'flow', 'global', 'env']}
/>
<Collapsible label="Fields ({embed.fields?.length ?? 0})" collapsed>
    <Button
        slot="header"
        inline
        small
        icon="plus"
        label="Add Field"
        on:click={() => {
            embed.fields = [...embed.fields, { inline: 'false' }];
        }}
    />
    <EditList
        bind:elements={embed.fields}
        elementLabel={(index) => embed.fields[index].name || `Field ${index + 1}`}
        let:index
    >
        <FieldBuilder bind:field={embed.fields[index]} />
    </EditList>
</Collapsible>
<Collapsible label="Image" collapsed>
    <ImageBuilder bind:image={embed.image} />
</Collapsible>
<Collapsible label="Thumbnail" collapsed>
    <ImageBuilder bind:image={embed.thumbnail} />
</Collapsible>

<Collapsible label="Author" collapsed>
    <Input bind:value={embed.author.name} label="Name" placeholder="Name" />
    <Input bind:value={embed.author.url} label="URL" placeholder="URL" />
    <Input bind:value={embed.author.icon_url} label="Icon URL" placeholder="Icon URL" />
</Collapsible>

<Collapsible label="Footer" collapsed>
    <Input bind:value={embed.footer.text} label="Text" placeholder="Text" />
    <Input bind:value={embed.footer.icon_url} label="Icon URL" placeholder="Icon URL" />
</Collapsible>

<style>
    .color-indicator {
        display: inline-block;
        width: 1em;
        height: 1em;
        border-radius: 50%;
        border: 1px solid #000;
        margin-right: 0.5em;
    }
</style>
