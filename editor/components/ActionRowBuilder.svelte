<script context="module">
    export { newRecord as newComponent } from './MessageComponentBuilder.svelte';
</script>

<script>
    import MessageComponentBuilder from './MessageComponentBuilder.svelte';
    import EditList from './EditList.svelte';

    export let row;

    function getComponentHeader(component) {
        if (component.type === 2) {
            return component.label ?? component.custom_id
                ? `Button: ${component.custom_id}`
                : 'Button';
        }
        return component.custom_id ? `Select Menu: ${component.custom_id}` : 'Select Menu';
    }
</script>

<EditList elementLabel={(i) => getComponentHeader(row[i])} bind:elements={row} let:index>
    <slot slot="action" name="action" />
    <MessageComponentBuilder bind:component={row[index]} disableSelect={row.length > 1} />
</EditList>
