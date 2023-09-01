declare module '*?red-icon' {
    const icon: string;
    export default icon;
}

declare module '*?red-res' {
    const path: string;
    export default path;
}

declare module '$package.json' {
    import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

    export const name: JSONSchemaForNPMPackageJsonFiles['name'];
    export const version: JSONSchemaForNPMPackageJsonFiles['version'];
    export const description: JSONSchemaForNPMPackageJsonFiles['description'];
    export const author: JSONSchemaForNPMPackageJsonFiles['author'];
    export const license: JSONSchemaForNPMPackageJsonFiles['license'];
    export const homepage: JSONSchemaForNPMPackageJsonFiles['homepage'];
    export const repository: JSONSchemaForNPMPackageJsonFiles['repository'];
}

declare module 'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js' {
    import twemoji from 'twemoji';
    export default twemoji as typeof twemoji & {
        replace(string: string, callback?: (icon: string) => string): string;
    };
}

declare module 'https://unpkg.com/emoji-regex@latest/index.mjs' {
    const emojiRegexp: () => RegExp;
    export default emojiRegexp;
}
