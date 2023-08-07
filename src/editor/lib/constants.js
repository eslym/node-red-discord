import icon from '$editor/icons/discord.png?red-icon';

export const undefinedType = {
    value: 'undefined',
    icon: 'fa-question',
    hasValue: false
};

export const noneType = {
    value: 'none',
    label: 'None',
    hasValue: false,
    icon: 'fa-minus-circle'
};

export const builderType = {
    value: 'builder',
    label: 'Message Builder',
    hasValue: false,
    icon: 'fa-wrench'
};

export const clientNodeContextKey = Symbol('clientNode');

export const baseNodeDef = {
    color: '#e4e7e9',
    icon: icon,
    labelStyle() {
        return this.name ? 'node_label_italic' : '';
    }
};
