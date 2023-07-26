<script>
    import { Input, TypedInput } from 'svelte-integration-red/components';

    export let field;

    $: if (typeof field !== 'object') {
        field = {
            inline: 'false'
        };
    }
</script>

<Input bind:value={field.name} placeholder="Name" label="Name" />
<Input bind:value={field.value} placeholder="Value" label="Value" />
<TypedInput bind:value={field.inline} type="bool" types={['bool']} label="Inline" />
