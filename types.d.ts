import { EditorRED } from 'node-red';

declare global {
    const RED: EditorRED;
    const __NODE_NAME__: string;
}

declare module '*?red-icon' {
    const icon: string;
    export default icon;
}
