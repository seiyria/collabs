const Output = require('./output')

generateInterfaceRecursively = function(p) {
  console.log(p);
  if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double", "char"].indexOf(p) > -1) {
    return 'number';
  } else if(p.literal && p.type === "array") {
    return `Array<${generateInterfaceRecursively(p.inner)}>`;
  } else if(p.literal && p.type === "record") {
    return `Record<${generateInterfaceRecursively(p.left)}, ${generateInterfaceRecursively(p.right)}>`;
  } else {
    return p;
  }
}

module.exports = (tokens, namespace, baseFilename) => {
  let contents = '';

  tokens.forEach(token => {
    let tokenRes = '';

    if(token.type === 'autoEnum') {
      const tokenPropStrings = token.props.map((p, i) => `\t${p.prop} = ${i},`);
      tokenRes = `
enum ${token.name} {
${tokenPropStrings.join('\n')}
}
      `
    }

    if(token.type === 'numEnum') {
      const tokenPropStrings = token.props.map(p => `\t${p.prop} = ${p.value},`);
      tokenRes = `
enum ${token.name} {
${tokenPropStrings.join('\n')}
}
      `
    }

    if(token.type === 'strEnum') {
      const tokenPropStrings = token.props.map(p => `\t${p.prop} = '${p.value}',`);
      tokenRes = `
enum ${token.name} {
${tokenPropStrings.join('\n')}
}
      `
    }

    if(token.type === 'interface') {
      let tokenPropStrings = [];
      token.props.forEach(p => {
        if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double", "char"].indexOf(p.typeInfo) > -1) {
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: number;`);
        } else if(p.typeInfo.literal && p.typeInfo.type === "array") {
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: Array<${generateInterfaceRecursively(p.typeInfo.inner)}>;`);
        } else if(p.typeInfo.literal && p.typeInfo.type === "record") {
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: Record<${generateInterfaceRecursively(p.typeInfo.left)}, ${generateInterfaceRecursively(p.typeInfo.right)}>;`);
        } else {
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: ${p.typeInfo};`);
        }
      });
      tokenRes = `
interface ${token.name} {
${tokenPropStrings.join('\n')}
}
      `
    }

    contents += tokenRes + '\n';
  });

  contents = contents
    .split('integer').join('number')
    .split('float').join('number')
    .split('char').join('string')
  ;

  return [new Output(baseFilename + ".ts", contents)];
};