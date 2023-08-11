<script>
    import { editingNodeContextKey } from '@eslym/rs4r/runtime';
    import { getContext, onDestroy } from 'svelte';
    import { writable, derived, get } from 'svelte/store';
    import Row from './Row.svelte';
    import Inline from './internal/Inline.svelte';
    import InternalInput from './internal/Input.svelte';
    import Config from './internal/Config.svelte';
    import { mergeClass } from './internal/utils';

    const editingNode = getContext(editingNodeContextKey) ?? writable(undefined);

    export let prop = undefined;
    export let label = undefined;
    export let placeholder = undefined;
    export let type = 'text';
    export let config = false;
    export let value = undefined;
    export let inline = false;
    export let disabled = false;
    export let required = false;

    let className = '';

    export { className as class };

    let _cleanup = new Set();

    let _config = false;
    let _credential = false;
    let _value = writable(value);
    let _bindVal = false;
    let _type = type;
    let _required = required;
    let _class = {};

    let state = {};

    function sync(p, t, c, r) {
        if (state.prop === p && state.type === t && state.config === c && state.required === r) {
            return;
        }
        state = {
            prop,
            type,
            config,
            required
        };
        cleanup();
        if (prop !== undefined && !$editingNode) {
            throw new Error('Input with prop must be used inside a node editor');
        }
        if (prop === undefined) {
            cleanup();
            if (config) {
                const def = RED.nodes.getType(config);
                if (def.category !== 'config') {
                    throw new Error(`Node ${config} is not a config node`);
                }
                _config = config;
            }
            _type = type;
            _value = writable(value);
            _cleanup.add(
                _value.subscribe((val) => {
                    if (value !== val) {
                        value = val;
                    }
                })
            );
            _bindVal = true;
            return;
        }
        _bindVal = false;
        const defs = $editingNode._def;
        const propDef = defs.defaults[prop] ?? defs.credentials[prop];
        if (!propDef) {
            throw new Error(`Property ${prop} not found in node ${node.type}`);
        }
        _credential = !!defs.credentials?.[prop];
        _required = propDef.required;
        _type = type;
        if (_credential) {
            if (propDef.type !== 'password') {
                if (!['password', 'text'].includes(type)) {
                    _type = 'text';
                }
                _value = writable($editingNode.credentials[prop]);
                _cleanup.add(_value.subscribe((v) => ($editingNode.credentials[prop] = v)));
                return;
            }
            let val = $editingNode.credentials[prop];
            let hasVal = $editingNode.credentials[`has_${prop}`];
            let _val = writable(val);
            let _display = derived(_val, (v) => {
                if (v !== undefined) {
                    return v;
                }
                return hasVal ? '********' : '';
            });
            _value = {
                subscribe: (a, b) => _display.subscribe(a, b),
                update: (a) => _val.update(a),
                set: (a) => _val.set(a)
            };
            _type = 'password';
            _cleanup.add(
                _val.subscribe((v) => {
                    if ($editingNode.credentials[prop] === v) return;
                    $editingNode.credentials[prop] = v;
                    if (propDef.validate) {
                        _class['input-error'] = !propDef.validate(v);
                    }
                })
            );
            _cleanup.add(
                editingNode.subscribe((node) => {
                    if (node.credentials[prop] === get(_val)) return;
                    _val.set(node.credentials[prop]);
                })
            );
            return;
        }
        _class = {};
        _value = writable($editingNode[prop]);
        _cleanup.add(
            _value.subscribe((v) => {
                if ($editingNode[prop] === v) return;
                $editingNode[prop] = v;
                if (propDef.validate) {
                    _class['input-error'] = !propDef.validate(v);
                }
            })
        );
        _cleanup.add(
            editingNode.subscribe((node) => {
                if (node[prop] === get(_value)) return;
                _value.set(node[prop]);
            })
        );
        _config = 'type' in propDef ? propDef.type : false;
    }

    $: sync(prop, type, config, required);

    $: if (_bindVal && $_value !== value) {
        $_value = value;
    }

    $: _class['maximize'] = !inline;

    function cleanup() {
        for (const action of _cleanup) {
            action();
            _cleanup.delete(action);
        }
    }

    onDestroy(cleanup);

    $: wrapper = inline ? Inline : Row;
</script>

<svelte:component this={wrapper}>
    {#if _config}
        {#if label}
            <label for={undefined} class:in-row={!inline}>
                <span>{label}</span>
                <Config
                    bind:value={$_value}
                    type={_config}
                    {disabled}
                    className={mergeClass(_class, className)}
                    required={_required}
                    on:change
                    on:click
                    on:focus
                    on:blur
                    on:keydown
                    on:keyup
                    on:input
                />
            </label>
        {:else}
            <Config
                bind:value={$_value}
                type={_config}
                {disabled}
                className={mergeClass(_class, className)}
                required={_required}
                on:change
                on:click
                on:focus
                on:blur
                on:keydown
                on:keyup
                on:input
            />
        {/if}
    {:else if label}
        <label class:in-row={!inline}>
            <span>{label}</span>
            <InternalInput
                type={_type}
                bind:value={$_value}
                className={mergeClass(_class, className)}
                required={_required}
                {placeholder}
                {disabled}
                on:change
                on:click
                on:focus
                on:blur
                on:keydown
                on:keyup
                on:input
            >
                <slot />
            </InternalInput>
        </label>
    {:else}
        <InternalInput
            type={_type}
            bind:value={$_value}
            className={mergeClass(_class, className)}
            required={_required}
            {placeholder}
            {disabled}
            on:change
            on:click
            on:focus
            on:blur
            on:keydown
            on:keyup
            on:input
        >
            <slot />
        </InternalInput>
    {/if}
</svelte:component>

<style>
    label {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
    }
    label.in-row > span {
        width: 100px;
    }
    label.in-row > :global(input),
    label.in-row > :global(select),
    label.in-row > :global(textarea) {
        flex-grow: 1;
    }
</style>
