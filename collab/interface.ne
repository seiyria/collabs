
### Interfaces

Interface -> 

  "interface" __ String _ "{" _ (InterfaceProp __):* "}" 
    {% 
    (d) => ({
      type: 'interface',
      name: d[2],
      props: d[6].flat().filter(Boolean)
    })
    %}

InterfaceProp ->
  String _ "?":? _ ":" _ InterfacePropType
  {%
  (d) => ({
    prop: d[0],
    optional: !!d[2],
    typeInfo: d[6][0]
  })
  %}

InterfacePropType -> 
  "boolean"  {% (d) => d %}
| "int32_t"  {% (d) => d %}
| "uint32_t" {% (d) => d %}
| "int64_t"  {% (d) => d %}
| "uint64_t" {% (d) => d %}
| "double"   {% (d) => d %}
| "float"    {% (d) => d %}
| "char"     {% (d) => d %}
| "string"   {% (d) => d %}
| "any"      {% (d) => d %}
| InterfaceArrayType  {% (d) => d %}
| InterfaceRecordType {% (d) => d %}

InterfaceArrayType -> 
  "Array<" _ InterfacePropType _ ">"
  {%
  (d) => {
    const checker = Array.isArray(d[2]) ? d[2][0] : d[2];
    const literal = `Array<${checker.literal ? checker.literal : checker}>`;
    return {
      type: 'array',
      inner: checker,
      literal
    };
  }
  %}

InterfaceRecordType -> 
  "Record<" _ InterfacePropType _ "," _ InterfacePropType _ ">"
  {%
  (d) => {
    const checker1 = Array.isArray(d[2]) ? d[2][0] : d[2];
    const checker2 = Array.isArray(d[6]) ? d[6][0] : d[6];

    const left = checker1.literal ? checker1.literal : checker1;
    const right = checker2.literal ? checker2.literal : checker2;

    const literal = `Record<${left}, ${right}>`;
    return {
      type: 'record',
      left: checker1,
      right: checker2,
      literal
    };
  }
  %}