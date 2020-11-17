const Output = require('./output')

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
      const tokenPropStrings = token.props.map(p => `\t${p.prop}${p.optional ? '?' : ''}: ${p.typeInfo.literal};`);
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