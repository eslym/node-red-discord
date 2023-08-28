<script context="module" lang="ts">
    const valueKey = Symbol('value');
</script>

<script lang="ts">
    import type { BuilderTypedInput, MessageBuilderConfig } from '$shared/types';
    import Textarea from '../Textarea.svelte';

    export let typedInput: BuilderTypedInput<MessageBuilderConfig> & {
        [valueKey]?: MessageBuilderConfig;
    };

    $: if (!typedInput[valueKey]) {
        typedInput[valueKey] = {
            embeds: { type: 'undefined', value: '' },
            components: { type: 'undefined', value: '' },
            attachments: { type: 'undefined', value: '' }
        };
        typedInput.config = typedInput[valueKey];
    } else if (!typedInput.config) typedInput.config = typedInput[valueKey];
</script>

<Textarea bind:value={typedInput.value} label="Content" placeholder="Message content" />
