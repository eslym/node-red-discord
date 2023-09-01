import rs4r from '@eslym/rs4r/rollup';
import fs from 'fs';
import { builtinModules } from 'module';
import typescript from '@rollup/plugin-typescript';
import preprocess from 'svelte-preprocess';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default rs4r({
    packageJsonOverride: {
        name: '@eslym/node-red-discord',
        scripts: {},
        devDependencies: {},
        files: ['**/*.js', '**/*.css', '*.html', 'icons/**/*']
    },
    svelteOptions: {
        preprocess: preprocess()
    },
    rollupPlugins: [typescript()],
    editorExternalDeps: [
        'https://unpkg.com/twemoji@latest/dist/twemoji.esm.js',
        'https://unpkg.com/emoji-regex@latest/index.mjs'
    ],
    nodeExternalDeps: [...Object.keys(pkg.dependencies || {}), builtinModules, /^node:/],
    sourceMap: true
});
