<script>
    import { undefinedType } from '../lib/constants';
    import { Input } from 'svelte-integration-red/components';
    import TypedInput from './TypedInput.svelte';

    export let image;

    $: if (typeof image !== 'object') {
        image = {};
    }
</script>

<Input bind:value={image.url} label="URL" type="text" placeholder="URL" />
<TypedInput
    bind:data={image.width}
    default={{ type: 'undefined', value: undefined }}
    types={[undefinedType, 'num', 'msg', 'flow', 'global', 'env']}
    label="Width"
/>
<TypedInput
    bind:data={image.height}
    default={{ type: 'undefined', value: undefined }}
    types={[undefinedType, 'num', 'msg', 'flow', 'global', 'env']}
    label="Height"
/>
