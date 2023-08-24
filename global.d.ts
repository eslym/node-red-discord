/// <reference types="svelte" />

import { EditorRED } from 'node-red';

declare global {
    const RED: EditorRED;
    const __NODE_NAME__: string;
}
