const Output = require('./output')

const generateHeader = function(namespace, tokens) {
    let stringInclude = false;
    let optionalInclude = false;
    let contents = '\n';
    let indent = '';
    if(namespace) {
        contents += 'namespace ' + namespace + '{\n';
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
                // const tokenPropStrings = token.props.map(p => `\t${p.prop}${p.optional ? '?' : ''}: ${p.typeInfo.literal};`);
                if(prop.typeInfo.literal === "any") {
                    console.log(`${token.name}: any not yet supported`);
                }

                if(prop.typeInfo.literal === "string") {
                    if(prop.optional) {
                        tokenRes += `${indent}    std::optional<std::string> ${prop.prop};`;
                        optionalInclude = true;
                    } else {
                        tokenRes += `${indent}    std::string ${prop.prop};`;
                    }
                    stringInclude = true;
                }

                if(prop.typeInfo.literal === "boolean") {
                    if(prop.optional) {
                        tokenRes += `${indent}    std::optional<bool> ${prop.prop};`;
                        optionalInclude = true;
                    } else {
                        tokenRes += `${indent}    bool ${prop.prop};`;
                    }
                }

                if(prop.typeInfo.literal === "Array") {
                    // some sort of recursion here, as every instance of Array<T> needs to be substituted for std::array<T>
                }

                if(prop.typeInfo.literal === "Record") {
                    // some sort of recursion here, as every instance of Record<K, V> needs to be substituted for std::map<K, V>
                }

                if(["int64_t, uint64_t, int32_t, uint32_t, float, double, char"].indexOf(prop.typeInfo.literal) > -1) {
                    if(prop.optional) {
                        tokenRes += `${indent}    std::optional<${prop.typeInfo.literal}> ${prop.prop};`;
                        optionalInclude = true;
                    } else {
                        tokenRes += `${indent}    ${prop.typeInfo.literal} ${prop.prop};`;
                    }
                }
            });
            tokenRes += `${indent};`;
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