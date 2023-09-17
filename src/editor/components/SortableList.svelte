<script lang="ts">
    import { faGripLines } from '@fortawesome/free-solid-svg-icons';

    import Fa from 'svelte-fa/src/fa';
    import Draggable, { dropzone } from './helpers/Draggable.svelte';

    type T = $$Generic<any>;

    export let list: T[];

    let dragContext = {};
</script>

<div class="rs4r-list">
    {#each list as item, index (item)}
        <Draggable let:target let:handle>
            <div
                use:target
                use:dropzone={{
                    canDrop: (_, data) => data.context === dragContext,
                    enter: (_, data) => {
                        if (data.index !== index) {
                            list[index] = list[data.index];
                            list[data.index] = item;
                        }
                    }
                }}
                class="rs4r-list-item"
            >
                <div use:handle={{ data: { index, context: dragContext } }} class="rs4r-handle">
                    <Fa icon={faGripLines} />
                </div>
                <div class="rs4r-content">
                    <slot {item} {index} />
                </div>
            </div>
        </Draggable>
    {/each}
</div>

<style lang="scss">
    .rs4r-list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--red-ui-secondary-border-color);
        border-radius: 4px;
        background-color: var(--red-ui-secondary-background);

        .rs4r-list-item {
            display: flex;
            flex-direction: row;
            padding: 8px 0;
            outline-offset: 2px;

            .rs4r-handle {
                width: 34px;
                height: 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: grab;
            }

            .rs4r-content {
                flex-grow: 1;
            }

            &:not(:last-child) {
                border-bottom: 1px solid var(--red-ui-secondary-border-color);
            }

            &:global(.dragging) {
                background-color: var(--red-ui-list-item-background-hover);
            }
        }
    }
</style>
