<script context="module" lang="ts">
    interface DropzoneConfig {
        canDrop?: (event: DragEvent, data: any) => boolean;
        drop: (event: DragEvent, data: any) => void;
        enter?: (event: DragEvent, data: any) => void;
        leave?: (event: DragEvent, data: any) => void;
        over?: (event: DragEvent, data: any) => void;
        dropzoneClass: string;
        dropEffect: 'move' | 'copy' | 'link' | 'none';
    }

    interface DraggableConfig {
        data: any;
        drag?: (event: DragEvent) => void;
        end?: (event: DragEvent) => void;
        dragstart?: (event: DragEvent) => void;
        draggingClass: string;
        dataTransfer?: Record<string, string>;
    }

    const defaultDraggableOpts = {
        draggingClass: 'dragging'
    };

    const defaultDropzoneOpts = {
        dropzoneClass: 'dropzone',
        dropEffect: 'move'
    };

    const dragData = new WeakMap<HTMLElement, any>();

    let draggedNode: HTMLElement | undefined = undefined;

    export function dropzone(
        node: HTMLElement,
        options: Partial<DropzoneConfig> | string | ((event: DragEvent, data: any) => void)
    ) {
        let state: DropzoneConfig;
        function update(
            options: Partial<DropzoneConfig> | string | ((event: DragEvent, data: any) => void)
        ) {
            if (typeof options === 'function') {
                options = {
                    drop: options
                } as any;
            } else if (typeof options === 'string') {
                options = {
                    ...defaultDropzoneOpts,
                    dropzoneClass: options
                } as any;
            } else if (typeof options !== 'object') {
                options = {
                    ...defaultDropzoneOpts
                } as any;
            }
            state = {
                ...defaultDropzoneOpts,
                ...(options as any)
            };
        }
        update(options);

        function dragEnter(event: DragEvent) {
            let data = dragData.get(draggedNode!);
            if (state.canDrop && !state.canDrop.call(undefined, event, data)) {
                return;
            }
            node.classList.add(state.dropzoneClass);
            if (state.enter) {
                state.enter.call(undefined, event, data);
            }
        }

        function dragLeave(event: DragEvent) {
            let data = dragData.get(draggedNode!);
            node.classList.remove(state.dropzoneClass);
            if (state.leave) {
                state.leave.call(undefined, event, data);
            }
        }

        function dragOver(event: DragEvent) {
            let data = dragData.get(draggedNode!);
            if (state.canDrop && !state.canDrop.call(undefined, event, data)) {
                return;
            }
            event.preventDefault();
            event.dataTransfer!.dropEffect = state.dropEffect;
            if (state.over) {
                state.over.call(undefined, event, data);
            }
        }

        function drop(event: DragEvent) {
            node.classList.remove(state.dropzoneClass);
            let data = dragData.get(draggedNode!);
            if (state.canDrop && !state.canDrop.call(undefined, event, data)) {
                return;
            }
            event.preventDefault();
            if (state.drop) {
                state.drop.call(undefined, event, data);
            }
        }

        node.addEventListener('dragenter', dragEnter);
        node.addEventListener('dragleave', dragLeave);
        node.addEventListener('dragover', dragOver);
        node.addEventListener('drop', drop);

        return {
            update,
            destroy() {
                node.removeEventListener('dragenter', dragEnter);
                node.removeEventListener('dragleave', dragLeave);
                node.removeEventListener('dragover', dragOver);
                node.removeEventListener('drop', drop);
            }
        };
    }
</script>

<script lang="ts">
    let targetNode: HTMLElement | undefined = undefined;
    let handleNode: HTMLElement | undefined = undefined;

    let mouseOffset = { x: 0, y: 0 };

    function dragTarget(node: HTMLElement) {
        if (targetNode) {
            throw new Error('Target node already set.');
        }
        targetNode = node;
        if (handleNode) handleNode.draggable = true;
        return {
            destroy() {
                if (handleNode) handleNode.draggable = false;
                targetNode = undefined;
            }
        };
    }

    function dragHandle(
        node: HTMLElement,
        options:
            | Partial<DraggableConfig>
            | ((event: DragEvent) => void)
            | number
            | string
            | any[]
            | boolean
            | symbol
            | null
            | undefined
    ) {
        if (handleNode) {
            throw new Error('Drag handle already set.');
        }
        handleNode = node;
        let state: DraggableConfig;
        let oldDraggable = node.draggable;
        if (targetNode) node.draggable = true;
        function update(options: Partial<DraggableConfig> | any) {
            if (typeof options === 'function') {
                options = {
                    dragstart: options
                } as any;
            } else if (typeof options !== 'object') {
                options = {
                    ...defaultDraggableOpts,
                    data: options
                };
            }
            state = {
                ...defaultDraggableOpts,
                ...options
            };
            dragData.set(node, state.data);
        }
        update(options);

        function mouseDown(event: MouseEvent) {
            mouseOffset = {
                x: event.offsetX,
                y: event.offsetY
            };
        }

        function dragStart(event: DragEvent) {
            if (!targetNode) return;
            draggedNode = node;
            targetNode.classList.add(state.draggingClass);
            if (state.dataTransfer) {
                for (let [type, val] of Object.entries(state.dataTransfer)) {
                    event.dataTransfer!.setData(type, val);
                }
            }
            const handleRect = node.getBoundingClientRect();
            const targetRect = targetNode.getBoundingClientRect();
            const offsetX = handleRect.x - targetRect.x + mouseOffset.x;
            const offsetY = handleRect.y - targetRect.y + mouseOffset.y;
            event.dataTransfer!.setDragImage(targetNode, offsetX, offsetY);
            if (state.drag) {
                state.drag.call(undefined, event);
            }
        }

        function dragEnd(event: DragEvent) {
            draggedNode = undefined;
            targetNode!.classList.remove(state.draggingClass);
            if (state.end) {
                state.end.call(undefined, event);
            }
        }

        node.addEventListener('mousedown', mouseDown);
        node.addEventListener('dragstart', dragStart);
        node.addEventListener('dragend', dragEnd);

        return {
            update,
            destroy() {
                handleNode = undefined;
                draggedNode = undefined;
                node.removeEventListener('mousedown', mouseDown);
                node.removeEventListener('dragstart', dragStart);
                node.removeEventListener('dragend', dragEnd);
                node.draggable = oldDraggable;
                if (targetNode) targetNode.classList.remove(state.draggingClass);
            }
        };
    }
</script>

<slot target={dragTarget} handle={dragHandle} />
