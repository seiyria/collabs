const Output = require('./output')
const CppCommon = require('./cppcommon')

const generateInterface = function(indent, prop) {
    return `${indent}    ${CppCommon.getPropType(prop)} ${prop.prop};\n`;
}

const generateHeader = function(namespace, tokens) {
    let contents = '\n';
    let indent = '';
    if(namespace) {
        contents += 'namespace ' + namespace + ' {\n';
        indent = '    ';
    }

    tokens.forEach(token => {
        let tokenRes = '';

        if(token.type === 'autoEnum') {
            const tokenPropStrings = token.props.map((p, i) => `${p.prop} = ${i},`);
            tokenRes = `
${indent}enum class ${token.name} {
${indent}    ${tokenPropStrings.join(`\n    ${indent}`)}
${indent}}`
        }

        if(token.type === 'numEnum') {
            const tokenPropStrings = token.props.map(p => `${p.prop} = ${p.value},`);
            tokenRes = `
${indent}enum class ${token.name} {
${indent}    ${tokenPropStrings.join(`\n    ${indent}`)}
${indent}}`
        }

        if(token.type === 'strEnum') {
            console.log(`${token.name}: string enum not supported in C++`);
        }

        if(token.type === 'interface') {
            tokenRes = `
${indent}struct ${token.name} {\n`;
            token.props.forEach(prop => {
                let newResult = generateInterface(indent, prop);

                if(newResult === '') {
                    return;
                }

                tokenRes += newResult;
            });
            tokenRes += `${indent}};\n`;
        }

        contents += tokenRes + '\n';
    });

    if(namespace) {
        contents += '}';
    }

    let top = '// GENERATED CONTENT\n';
    top += '#pragma once\n';
    top += '#include <string>\n';
    top += '#include <optional>\n';
    top += '#include <vector>\n';
    top += '#include <tuple>\n';
    return top + contents;
}

module.exports = (tokens, namespace, baseFilename) => {
  let header = new Output(baseFilename + '.h', '');

  header.contents = generateHeader(namespace, tokens);

  return [header];
};