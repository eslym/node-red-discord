<script>
    export let type;
    export let value;
    export let placeholder;
    export let disabled = false;
    export let required = false;
    export let className = '';
</script>

{#if type === 'checkbox'}
    <label>
        <input
            type="checkbox"
            bind:checked={value}
            {disabled}
            {required}
            class={className}
            on:change
            on:click
            on:focus
            on:blur
            on:keydown
            on:keyup
            on:input
        />
        <span>{placeholder}</span>
    </label>
{:else if type === 'password'}
    <input
        type="password"
        bind:value
        {placeholder}
        {disabled}
        {required}
        class={className}
        on:change
        on:click
        on:focus
        on:blur
        on:keydown
        on:keyup
        on:input
    />
{:else if type === 'number'}
    <input
        type="number"
        bind:value
        {placeholder}
        {disabled}
        {required}
        class={className}
        on:change
        on:click
        on:focus
        on:blur
        on:keydown
        on:keyup
        on:input
    />
{:else if type === 'textarea'}
    <textarea
        bind:value
        {placeholder}
        {disabled}
        {required}
        class={className}
        on:change
        on:click
        on:focus
        on:blur
        on:keydown
        on:keyup
        on:input
    />
{:else if type === 'select'}
    <select
        bind:value
        {placeholder}
        {disabled}
        {required}
        class={className}
        on:change
        on:click
        on:focus
        on:blur
        on:keydown
        on:keyup
        on:input
    >
        <slot />
    </select>
{:else}
    <input
        type="text"
        bind:value
        {placeholder}
        {disabled}
        {required}
        class={className}
        on:change
        on:click
        on:focus
        on:blur
        on:keydown
        on:keyup
        on:input
    />
{/if}
