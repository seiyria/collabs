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
      let tokenPropStrings = [];
      token.props.forEach(p => {
        if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double", "char"].indexOf(p.typeInfo) > -1) {
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: number;`);
        } else if(p.typeInfo.literal && p.typeInfo.type === "array") {
          let literal = 'Array<';
          let inner = p.typeInfo.inner;
          let endBracketCount = 1;
          while(inner && inner.inner !== undefined) {
            console.log(inner);
            literal += 'Array<';
            inner = inner.inner;
            endBracketCount++;
          }
          literal += inner;
          while(endBracketCount > 0) {
            literal += '>';
            endBracketCount--;
          }
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: ${literal};`);
        } else if(p.typeInfo.literal && p.typeInfo.type === "record") {
          console.log(p.typeInfo);
          let literal = 'Record<';
          let left = p.typeInfo.left;
          let leftEndBracketCount = 0;
          while(left && left.left !== undefined) {
            console.log(left);
            literal += 'Record<';
            left = left.left;
            leftEndBracketCount++;
          }
          literal += left;
          while(leftEndBracketCount > 0) {
            literal += '>';
            leftEndBracketCount--;
          }
          literal += ', ';
          let right = p.typeInfo.right;
          let rightEndBracketCount = 0;
          while(right && right.right !== undefined) {
            console.log(right);
            literal += 'Record<';
            right = right.right;
            rightEndBracketCount++;
          }
          literal += right;
          while(rightEndBracketCount > 0) {
            literal += '>';
            rightEndBracketCount--;
          }
          literal += '>';
          tokenPropStrings.push(`\t${p.prop}${p.optional ? '?' : ''}: ${literal};`);
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