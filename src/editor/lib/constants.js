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
    color: '#f2f3f5',
    icon: icon
};