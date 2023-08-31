<script lang="ts">
    import { Icon, tooltip, selection } from '@eslym/rs4r/components';
    import type { ComponentType } from 'svelte';
    import { writable } from 'svelte/store';
    import MultiSelectOption from './MultiSelectOption.svelte';

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
    export let id: string;

    let inputFocus = false;
    let toggleFocus = false;

    let inputElement: HTMLInputElement;

    let search = '';

    $: allSelected = options.every((o) => value.includes(typeof o === 'string' ? o : o.value));
    $: focusState = inputFocus || toggleFocus || $menuShown;
    $: $selectionOptions = filterSelection(search, value);

    function filterSelection(filter: string, _: any) {
        let res = options
            .map((o) =>
                typeof o === 'string'
                    ? { component: MultiSelectOption, label: o, value: o }
                    : {
                          ...o,
                          component: MultiSelectOption
                      }
            )
            .filter((o) => !value.includes(o.value));
        if (filter) {
            res = res.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()));
        }
        if (res.length === 0) {
            $menuShown = false;
        }
        return res;
    }

    function inputKeydown(event: KeyboardEvent) {
        const cursorLast =
            inputElement.selectionStart === inputElement.selectionEnd &&
            inputElement.selectionEnd === value.length;
        const toSuggestion =
            event.key === 'ArrowDown' || (cursorLast && event.key === 'ArrowRight');
        if (toSuggestion && $menuShown) {
            $focus();
            event.preventDefault();
            return;
        }
        if (
            event.key.length === 1 ||
            event.key === 'Backspace' ||
            event.key === 'Delete' ||
            event.key === 'ArrowDown'
        ) {
            $menuShown = $selectionOptions.length > 0;
        } else if (event.key === 'Escape') $menuShown = false;
    }
</script>

<div class="red-ui-typedInput-container" class:red-ui-typedInput-focus={focusState}>
    <button
        class="red-ui-typedInput-option-expand"
        use:tooltip={allSelected ? 'Remove All' : 'Select All'}
        on:focus={() => (toggleFocus = true)}
        on:blur={() => (toggleFocus = false)}
        on:click={() => {
            if (allSelected) {
                value = [];
            } else {
                value = [...value, ...$selectionOptions.map((o) => o.value)];
            }
        }}
    >
        <Icon
            icon={{
                fa4: allSelected
                    ? 'check-square-o'
                    : value.length === 0
                    ? 'square-o'
                    : 'minus-square-o'
            }}
            class="red-ui-typedInput-icon"
        />
    </button>
    <div class="red-ui-typedInput-input-wrap">
        <input
            class="red-ui-typedInput-input"
            {id}
            type="text"
            placeholder="Search for Intent"
            bind:this={inputElement}
            bind:value={search}
            on:keydown={inputKeydown}
            on:focus={() => {
                $menuShown = $selectionOptions.length > 0;
                inputFocus = true;
            }}
            on:blur={() => (inputFocus = false)}
            use:selection={{
                focus,
                shown: menuShown,
                options: selectionOptions,
                onSelect: (o) => {
                    if (!value.includes(o.value)) {
                        value = [...value, o.value];
                    }
                    inputElement.focus();
                }
            }}
        />
    </div>
</div>

<style lang="scss">
    .red-ui-typedInput-container {
        flex-grow: 1;
    }
    .red-ui-typedInput-option-expand {
        width: 28px;
    }
</style>
