import icon from '$editor/icons/discord.svg?red-icon';
import type { EditorNodeDef, EditorNodeInstance, EditorNodeProperties } from 'node-red';

export const clientNodeContextKey = Symbol('clientNode');

export const baseNodeDef = {
    color: '#e4e7e9',
    icon: icon,
    labelStyle(this: EditorNodeInstance): string {
        return this.name ? 'node_label_italic' : '';
    },
    label(this: EditorNodeInstance<EditorNodeProperties & { _def: EditorNodeDef }>) {
        if (this.name) return this.name;
        const paletteLabel = this._def.paletteLabel;
        if (typeof paletteLabel === 'function') {
            return paletteLabel.call(this);
        }
        return paletteLabel;
    }
};
