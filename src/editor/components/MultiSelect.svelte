<script lang="ts">
    import { Icon, tooltip, selection } from '@eslym/rs4r/components';
    import type { ComponentType } from 'svelte';
    import { writable } from 'svelte/store';

    interface SelectOption {
        value: string;
        label: string;
        description?: string;
    }

    const selectionOptions = writable<(SelectOption & { component: ComponentType })[]>([]);
    const menuShown = writable<boolean>(false);
    const focus = writable<() => void>(() => undefined);

    export let value: string[] = [];
    export let options: (SelectOption | string)[];

    let menu = false;

    $: allSelected = options.every((o) => value.includes(typeof o === 'string' ? o : o.value));
    $: $menuShown = menu && $selectionOptions.length > 0;
</script>

<div class="red-ui-typedInput-container">
    <div class="red-ui-typedInput-input-wrap">
        <input
            class="red-ui-typedInput-input"
            id="dc-intents"
            type="text"
            placeholder="Search for Intent"
        />
    </div>
    <button
        class="red-ui-typedInput-option-expand"
        use:tooltip={allSelected ? 'Remove All' : 'Select All'}
    >
        <Icon icon={{ fa4: allSelected ? 'times' : 'check' }} class="red-ui-typedInput-icon" />
    </button>
</div>

<style lang="scss">
    .red-ui-typedInput-container {
        flex-grow: 1;
    }
    .red-ui-typedInput-option-expand {
        padding: 0 5px;
    }
</style>
