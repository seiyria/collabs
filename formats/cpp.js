const Output = require('./output')

const generateRecursively = function(prop) {
    if(prop === "any") {
        console.log(`${prop.prop}: any not yet supported`);
        return '';
    }

    if(prop === "string") {
        return 'std::string';
    }

    if(prop === "boolean") {
        return 'bool';
    }

    if(prop.literal && prop.literal.startsWith("Array")) {
        return `std::vector<${generateRecursively(prop.inner)}>`;
    }

    if(prop.literal && prop.literal === "Record") {
        return `std::tuple<${generateRecursively(prop.left)}, ${generateRecursively(prop.right)}>`;
    }

    if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double", "char"].indexOf(prop) > -1) {
        return `${prop}`;
    }

    return '';
}

const generateInterface = function(indent, prop) {
    let newResult = '';
    console.log(`prop: ${prop}, ${prop.typeInfo}, ${prop.typeInfo.literal}, ${["int64_t, uint64_t, int32_t, uint32_t, float, double, char"].indexOf(prop.typeInfo)}`);

    if(prop.typeInfo === "any") {
        console.log(`${prop.prop}: any not yet supported`);
    }

    if(prop.typeInfo === "string") {
        console.log(`string: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<std::string> ${prop.prop};\n`;
        } else {
            newResult += `${indent}    std::string ${prop.prop};\n`;
        }
    }

    if(prop.typeInfo === "boolean") {
        console.log(`boolean: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<bool> ${prop.prop};\n`;
        } else {
            newResult += `${indent}    bool ${prop.prop};\n`;
        }
    }

    if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Array")) {
        console.log(`array: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<std::vector<${generateRecursively(prop.typeInfo.inner)}>> ${prop.prop};\n`;
        } else {
            newResult += `${indent}    std::vector<${generateRecursively(prop.typeInfo.inner)}> ${prop.prop};\n`;
        }
    }

    if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Record")) {
        console.log(`record: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<std::tuple<${generateRecursively(prop.typeInfo.left)}, ${generateRecursively(prop.typeInfo.right)}>> ${prop.prop};\n`;
        } else {
            newResult += `${indent}    std::tuple<${generateRecursively(prop.typeInfo.left)}, ${generateRecursively(prop.typeInfo.right)}> ${prop.prop};\n`;
        }

    }

    if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double", "char"].indexOf(prop.typeInfo) > -1) {
        console.log(`default: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<${prop.typeInfo}> ${prop.prop};\n`;
        } else {
            newResult += `${indent}    ${prop.typeInfo} ${prop.prop};\n`;
        }
    }

    return newResult;
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

    let top = '#pragma once\n';
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