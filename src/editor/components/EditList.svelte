<script>
    import { Collapsible, EditableList, Button } from 'svelte-integration-red/components';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let elements;
    export let elementLabel = '';
    export let emptyLabel = '';

    export let label = '';

    function getElementLabel(index) {
        return typeof elementLabel === 'function'
            ? elementLabel(index)
            : `${elementLabel} ${index + 1}`;
    }
</script>

{#if elements.length > 0}
    <EditableList
        bind:elements
        minHeight="0"
        maxHeight="auto"
        sortable
        let:index
        let:element
        {label}
    >
        <Collapsible label={getElementLabel(index)}>
            <div class="action-row" slot="header">
                <slot name="action" {index} {element} />
                <Button
                    small
                    inline
                    icon="times"
                    on:click={() => {
                        elements.splice(index, 1);
                        elements = elements;
                        dispatch('remove', { index });
                    }}
                />
            </div>
            <slot {index} {element} />
        </Collapsible>
    </EditableList>
{:else}
    <span style="text-align: center;">{emptyLabel || 'Empty'}</span>
{/if}

<style>
    .action-row {
        display: flex;
        flex-direction: row;
    }
</style>
