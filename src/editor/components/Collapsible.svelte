<script lang="ts">
    import Fa from 'svelte-fa/src/fa';
    import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{ 'header-click': boolean }>();

    export let expand: boolean | undefined = true;
    export let dispose: boolean | undefined = true;

    function headerClick() {
        if (dispatch('header-click', !expand, { cancelable: true })) expand = !expand;
    }
</script>

<div class="rs4r-collapsible">
    <button type="button" class="rs4r-header" class:rs4r-expanded={expand} on:click={headerClick}>
        <Fa icon={faAngleRight} />
        <slot name="header" />
    </button>
    {#if !dispose || expand}
        <div class="rs4r-content" class:rs4r-shown={expand} transition:slide>
            <slot />
        </div>
    {/if}
</div>

<style lang="scss">
    .rs4r-collapsible {
        margin-bottom: 12px;
    }
    .rs4r-header {
        display: block;
        box-sizing: border-box;
        width: 100%;
        border: none;
        background: none;
        outline-color: var(--red-ui-form-input-focus-color);
        display: flex;
        cursor: pointer;
        padding: 5px 10px;
        font-weight: bold;
        align-items: center;

        & > :global(:first-child) {
            display: block;
            margin-right: 10px;
            transition: transform 0.4s ease-in-out;
        }

        &.rs4r-expanded > :global(:first-child) {
            transform: rotate(90deg);
        }
    }

    .rs4r-content {
        display: none;
        padding: 5px 10px;

        &.rs4r-shown {
            display: block;
        }
    }
</style>
