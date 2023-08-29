import { version } from '$package.json';
import type { EditorNodeDef, EditorNodeInstance, EditorNodeProperties } from 'node-red';
import { baseNodeDef } from './constants';

export function createRegister<
    P extends EditorNodeProperties = EditorNodeProperties,
    C = undefined
>(name: string, def: EditorNodeDef<P, C>) {
    return function (
        render: (node: EditorNodeInstance<P>) => void,
        update: (node: EditorNodeInstance<P>) => boolean,
        revert: (node: EditorNodeInstance<P>) => void
    ) {
        (def.defaults as any)._version = {
            value: version
        };
        RED.nodes.registerType(name, {
            ...(baseNodeDef as any),
            ...def,
            oneditprepare(this: EditorNodeInstance<P>) {
                def.oneditprepare?.call?.(this);
                render(this);
            },
            oneditcancel(this: EditorNodeInstance<P>) {
                def.oneditcancel?.call?.(this);
                revert(this);
            },
            oneditsave(this: EditorNodeInstance<P>) {
                return def.oneditsave?.call?.(this) ?? update(this);
            }
        });
    };
}
