<script lang="ts">
    import Fa from 'svelte-fa/src/fa';
    import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
    import { slide } from 'svelte/transition';

    export let expand: boolean | undefined = true;
</script>

<div class="rs4r-collapsible">
    <button type="button" class="rs4r-header" on:click={() => (expand = !expand)}>
        <Fa icon={faAngleDown} rotate={expand ? 0 : -90} />
        <slot name="header" />
    </button>
    {#if expand}
        <div class="rs4r-content" transition:slide>
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
        padding: 10px 15px;
        font-weight: bold;
        align-items: center;

        & > :global(:first-child) {
            display: block;
            margin-right: 10px;
            transition: transform;
        }
    }

    .rs4r-content {
        padding: 5px 10px;
    }
</style>
