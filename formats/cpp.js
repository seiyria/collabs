const Output = require('./output')

const generateInterface = function(indent, prop) {
    let newStringInclude = false;
    let newOptionalInclude = false;
    let newResult = '';
    console.log(`prop: ${prop}, ${prop.typeInfo}, ${prop.typeInfo.literal}, ${["int64_t, uint64_t, int32_t, uint32_t, float, double, char"].indexOf(prop.typeInfo)}`);

    if(prop.typeInfo === "any") {
        console.log(`${prop.prop}: any not yet supported`);
    }

    if(prop.typeInfo === "string") {
        console.log(`string: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<std::string> ${prop.prop};\n`;
            newOptionalInclude = true;
        } else {
            newResult += `${indent}    std::string ${prop.prop};\n`;
        }
        newStringInclude = true;
    }

    if(prop.typeInfo === "boolean") {
        console.log(`boolean: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<bool> ${prop.prop};\n`;
            newOptionalInclude = true;
        } else {
            newResult += `${indent}    bool ${prop.prop};\n`;
        }
    }

    if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Array")) {
        console.log(`array: ${prop}`);
        // some sort of recursion here, as every instance of Array<T> needs to be substituted for std::array<T>
    }

    if(prop.typeInfo.literal && prop.typeInfo.literal === "Record") {
        console.log(`record: ${prop}`);
        // some sort of recursion here, as every instance of Record<K, V> needs to be substituted for std::map<K, V>
    }

    if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double", "char"].indexOf(prop.typeInfo) > -1) {
        console.log(`default: ${prop}`);
        if(prop.optional) {
            newResult += `${indent}    std::optional<${prop.typeInfo}> ${prop.prop};\n`;
            newOptionalInclude = true;
        } else {
            newResult += `${indent}    ${prop.typeInfo} ${prop.prop};\n`;
        }
    }

    return {newStringInclude, newOptionalInclude, newResult};
}

const generateHeader = function(namespace, tokens) {
    let stringInclude = false;
    let optionalInclude = false;
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
                let {newStringInclude, newOptionalInclude, newResult} = generateInterface(indent, prop);

                if(newResult === '') {
                    return;
                }

                if(newStringInclude) {
                    stringInclude = true;
                }
                if(newOptionalInclude) {
                    optionalInclude = true;
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
    if(stringInclude) {
        top += '#include <string>\n';
    }
    if(optionalInclude) {
        top += '#include <optional>\n';
    }
    return top + contents;
}

module.exports = (tokens, namespace, baseFilename) => {
  let header = new Output(baseFilename + '.h', '');

  header.contents = generateHeader(namespace, tokens);

  return [header];
};