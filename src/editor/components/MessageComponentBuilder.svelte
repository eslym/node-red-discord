<script context="module">
    export function newRecord() {
        return {
            type: 2,
            style: 1,
            options: [],
            channel_types: []
        };
    }
</script>

<script>
    import {
        Input,
        Select,
        Collapsible,
        Button,
        ToggleGroup
    } from 'svelte-integration-red/components';
    import TypedInput from './TypedInput.svelte';
    import EmojiInput from './EmojiInput.svelte';
    import { undefinedType } from '../lib/constants';
    import EditList from './EditList.svelte';

    export let component;

    export let disableSelect = false;
</script>

<Select label="Type" bind:value={component.type}>
    <option value={2}>Button</option>
    {#if !disableSelect}
        <option value={3} disabled={disableSelect}>Select Menu</option>
        <option value={5} disabled={disableSelect}>User Select</option>
        <option value={6} disabled={disableSelect}>Role Select</option>
        <option value={7} disabled={disableSelect}>Mentionable Select</option>
        <option value={8} disabled={disableSelect}>Channel Select</option>
    {/if}
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
{:else}
    <Input label="Placeholder" placeholder="Placeholder" bind:value={component.placeholder} />
    {#if component.type === 3}
        <Collapsible label="Options" collapsed>
            <Button
                slot="header"
                label="Add Option"
                icon="plus"
                small
                on:click={() => {
                    component.options = [...component.options, {}];
                }}
            />
            <EditList
                bind:elements={component.options}
                elementLabel={(index) => component.options[index].label || `Option ${index + 1}`}
                let:index
            >
                <Input
                    label="Label"
                    placeholder="Label"
                    bind:value={component.options[index].label}
                />
                <Input
                    label="Value"
                    placeholder="Value"
                    bind:value={component.options[index].value}
                />
                <Input
                    label="Description"
                    placeholder="Description"
                    bind:value={component.options[index].description}
                />
                <EmojiInput label="Emoji" bind:emoji={component.options[index].emoji} />
                <TypedInput
                    label="Default"
                    bind:data={component.options[index].default}
                    default={{ type: 'bool', value: 'false' }}
                    types={['bool', 'msg', 'flow', 'global', 'env']}
                />
            </EditList>
        </Collapsible>
    {:else if component.type === 8}
        <Collapsible label="Channel Types">
            <ToggleGroup
                options={[
                    {
                        value: 0,
                        label: 'Guild Text'
                    },
                    {
                        value: 1,
                        label: 'DM'
                    },
                    {
                        value: 2,
                        label: 'Guild Voice'
                    },
                    {
                        value: 3,
                        label: 'Group DM'
                    },
                    {
                        value: 4,
                        label: 'Guild Category'
                    },
                    {
                        value: 5,
                        label: 'Guild Announcement'
                    },
                    {
                        value: 10,
                        label: 'Annoucement Thread'
                    },
                    {
                        value: 11,
                        label: 'Public Thread'
                    },
                    {
                        value: 12,
                        label: 'Private Thread'
                    },
                    {
                        value: 13,
                        label: 'Stage Voice'
                    },
                    {
                        value: 14,
                        label: 'Guild Directory'
                    },
                    {
                        value: 15,
                        label: 'Guild Forum'
                    }
                ]}
                multiselect={true}
                showHeader={false}
                type="checkbox"
                flexDirection="column"
                inline={false}
            />
        </Collapsible>
    {/if}
    <TypedInput
        label="Min Length"
        placeholder="Minimum Choice"
        bind:data={component.minLength}
        default={{ value: undefined, type: 'undefined' }}
        types={[undefinedType, 'num', 'msg', 'flow', 'global', 'env']}
    />
    <TypedInput
        label="Max Length"
        placeholder="Maximum Choice"
        bind:data={component.maxLength}
        default={{ value: undefined, type: 'undefined' }}
        types={[undefinedType, 'num', 'msg', 'flow', 'global', 'env']}
    />
{/if}
<TypedInput
    label="Disabled"
    bind:data={component.disabled}
    default={{ type: 'bool', value: 'false' }}
    types={['bool', 'msg', 'flow', 'global', 'env']}
/>
