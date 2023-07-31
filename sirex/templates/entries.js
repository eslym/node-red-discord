/* generated */ function e(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function* r(data) {
    for (let index = 0; index < data['imports'].length; index++) {
        yield 'import { default as Component_';
        yield index;
        yield ', register as register_';
        yield index;
        yield ' } from ';
        yield JSON.stringify(data['imports'][index]['path']);
        yield ';\n';
    }
    yield "import { registerHelper } from './helper.js';\n\nwindow.SIREX = window.SIREX || {};\n\nif(!window.SIREX[";
    yield JSON.stringify(data['packageName']);
    yield ']) {\n    const entries = {\n';
    for (let index = 0; index < data['imports'].length; index++) {
        yield '        ';
        yield JSON.stringify(data['imports'][index]['name']);
        yield ': { component: Component_';
        yield index;
        yield ', register: register_';
        yield index;
        yield ' },\n';
    }
    yield '    };\n    window.SIREX[';
    yield JSON.stringify(data['packageName']);
    yield '] = {\n        register: function(name) {\n            registerHelper({\n                name:';
    yield JSON.stringify(data['packageName']);
    yield ',\n                version:';
    yield JSON.stringify(data['version']);
    yield "\n            }, entries, name)\n        },\n        entries\n    };\n\n    const link = document.createElement('link');\n    link.rel = 'stylesheet';\n    link.href = `resources/${ ";
    yield JSON.stringify(data['packageName']);
    yield ' }/bundle.css`;\n    document.head.appendChild(link);\n} else {\n    console.warn(`SIREX: Package';
    yield JSON.stringify(data['packageName']);
    yield 'already exists.`)\n}\n\nexport default window.SIREX[';
    yield JSON.stringify(data['packageName']);
    yield '];\n';
}
module.exports = (data) => [...r(data)].join('');
