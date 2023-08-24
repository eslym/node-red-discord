import icon from '$editor/icons/discord.png?red-icon';
import type { EditorNodeInstance } from 'node-red';

export const clientNodeContextKey = Symbol('clientNode');

export const baseNodeDef = {
    color: '#e4e7e9',
    icon: icon,
    labelStyle(this: EditorNodeInstance): string {
        return this.name ? 'node_label_italic' : '';
    }
};
