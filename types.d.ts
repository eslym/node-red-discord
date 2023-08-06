import { EditorRED } from 'node-red';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

declare global {
    const RED: EditorRED;
    const __NODE_NAME__: string;
}

declare module '*?red-icon' {
    const icon: string;
    export default icon;
}

declare module '$package.json' {
    export const name: JSONSchemaForNPMPackageJsonFiles['name'];
    export const version: JSONSchemaForNPMPackageJsonFiles['version'];
    export const description: JSONSchemaForNPMPackageJsonFiles['description'];
    export const author: JSONSchemaForNPMPackageJsonFiles['author'];
    export const license: JSONSchemaForNPMPackageJsonFiles['license'];
    export const homepage: JSONSchemaForNPMPackageJsonFiles['homepage'];
    export const repository: JSONSchemaForNPMPackageJsonFiles['repository'];
}
