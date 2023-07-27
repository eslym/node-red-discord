<script>
    import { Collapsible, EditableList, Button } from 'svelte-integration-red/components';
    import MessageComponentBuilder from './MessageComponentBuilder.svelte';

    export let row;
    export let label = '';

    if (!Array.isArray(row)) {
        row = [];
    }

    function getComponentHeader(component) {
        if (component.type === 2) {
            return component.label ?? component.custom_id
                ? `Button: ${component.custom_id}`
                : 'Button';
        }
        return component.custom_id ? `Select Menu: ${component.custom_id}` : 'Select Menu';
    }
</script>

<Collapsible
    label="{label ? label : 'Row'} ({row?.length ?? 0} component{row?.length > 0 ? 's' : ''})"
>
    <div slot="header" style="display: flex; flex-direction:row;">
        <Button
            icon="plus"
            label="Add Component"
            small
            inline
            disabled={row.length > 0 && (row.length >= 5 || row[0].type !== 2)}
            on:click={() => (row = [...row, { type: 2 }])}
        />
        <slot name="header" />
    </div>
    {#if row?.length > 0}
        <EditableList bind:elements={row} minHeight="0" maxHeigt="auto" sortable let:index>
            <Collapsible label={getComponentHeader(row[index])}>
                <Button
                    slot="header"
                    small
                    inline
                    icon="times"
                    on:click={() => {
                        row.splice(index, 1);
                        row = row;
                    }}
                />
                <MessageComponentBuilder
                    bind:component={row[index]}
                    disableSelect={row.length > 1}
                />
            </Collapsible>
        </EditableList>
    {:else}
        <span style="text-align: center;">Empty Row</span>
    {/if}
</Collapsible>
