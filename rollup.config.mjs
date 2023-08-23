import rs4r from '@eslym/rs4r/rollup';
import fs from 'fs';
import { builtinModules } from 'module';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default rs4r({
    packageJsonOverride: {
        name: '@eslym/node-red-discord',
        scripts: {},
        devDependencies: {},
        files: ['**/*.js', '**/*.css', '*.html', 'icons/**/*']
    },
    nodeExternalDeps: [...Object.keys(pkg.dependencies || {}), builtinModules, /^node:/],
    sourceMap: true
});
