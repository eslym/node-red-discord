import icon from '$editor/icons/discord.png?red-icon';

export const clientNodeContextKey = Symbol('clientNode');

export const baseNodeDef = {
    color: '#e4e7e9',
    icon: icon,
    labelStyle() {
        return this.name ? 'node_label_italic' : '';
    }
};
