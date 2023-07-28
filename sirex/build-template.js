const { parse } = require('@handlebars/parser');
const fs = require('fs');
const path = require('path');

// A simple handlebars template compiler with minimum dependencies and features.

function buildProgram(program, data = 'data') {
    return program.body
        .map((node) => {
            switch (node.type) {
                case 'ContentStatement':
                    return buildVal(JSON.stringify(node.value), node.escaped);
                case 'MustacheStatement':
                    if (!node.params.length) {
                        return buildVal(buildPath(node.path, data), node.escaped);
                    } else {
                        return buildVal(buildCall(node, data), node.escaped);
                    }
                case 'BlockStatement':
                    return buildBlock(node, data);
            }
        })
        .filter((n) => n)
        .join(';');
}

function buildBlock(node, data = 'data') {
    switch (node.path.original) {
        case 'if':
            return buildIf(node, data);
        case 'each':
            return buildEach(node, data);
        default:
            throw new Error(`Unknown block statement: ${node.path.original}`);
    }
}

function buildIf(node, data = 'data') {
    return `if (${buildPath(node.params[0], data)}) {${buildProgram(node.program, data)}}`;
}

function buildEach(node, data = 'data') {
    const current = buildPath(node.params[0], data);
    return `for (let index = 0; index < ${current}.length; index++) {${buildProgram(
        node.program,
        current + '[index]'
    )} }`;
}

function buildPath(node, data = 'data') {
    if (node.data) {
        switch (node.original) {
            case '@index':
                return 'index';
            default:
                throw new Error(`Unknown data statement: ${node.original}`);
        }
    }
    return `${data}${node.parts.map((p) => `[${JSON.stringify(p)}]`).join('')}`;
}

function buildCall(node, data = 'data') {
    let fn;
    switch (node.path.original) {
        case 'json':
            fn = 'JSON.stringify';
            break;
        default:
            throw new Error(`Unknown call statement: ${node.path.original}`);
    }
    const args = node.params.map((p) => buildPath(p, data)).join(', ');
    return `${fn}(${args})`;
}

function buildVal(expression, escaped) {
    return escaped ? `yield e(${expression})` : `yield ${expression}`;
}

function buildTemplate(file) {
    const input = fs.readFileSync(file, 'utf8');
    const ast = parse(input);

    const output = `/* generated */function e(s){return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");};function *r(data) {${buildProgram(
        ast
    )}};module.exports=(data)=>[...r(data)].join('');`;

    fs.writeFileSync(file.replace(/\.hbs$/, '.js'), output);
}

buildTemplate(path.join(__dirname, 'templates', 'entries.hbs'));
buildTemplate(path.join(__dirname, 'templates', 'html.hbs'));
