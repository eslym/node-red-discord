<script>
    import { Collapsible, EditableList, Button } from 'svelte-integration-red/components';
    import MessageComponentBuilder from './MessageComponentBuilder.svelte';

    let _row;
    export let label = '';
    export let collapsed = false;

    export { _row as row };

    let newlyAdded = _row.length;

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
    bind:collapsed
    label="{label ? label : 'Row'} ({_row?.length ?? 0} component{_row?.length > 0 ? 's' : ''})"
>
    <div slot="header" style="display: flex; flex-direction:row;">
        <Button
            icon="plus"
            label="Add Component"
            small
            inline
            disabled={_row.length > 0 && (_row.length >= 5 || _row[0].type !== 2)}
            on:click={() => {
                newlyAdded = _row.length;
                _row = [..._row, { type: 2 }];
                collapsed = false;
            }}
        />
        <slot name="header" />
    </div>
    {#if _row.length > 0}
        <EditableList bind:elements={_row} minHeight="0" maxHeigt="auto" sortable let:index>
            <Collapsible label={getComponentHeader(_row[index])} collapsed={index < newlyAdded}>
                <Button
                    slot="header"
                    small
                    inline
                    icon="times"
                    on:click={() => {
                        _row.splice(index, 1);
                        _row = _row;
                    }}
                />
                <MessageComponentBuilder
                    bind:component={_row[index]}
                    disableSelect={_row.length > 1}
                />
            </Collapsible>
        </EditableList>
    {:else}
        <span style="text-align: center;">Empty Row</span>
    {/if}
</Collapsible>
