
### Enums: AutoEnum, NumEnum, StringEnum

Enum -> 

  # "Auto enum" variant

  "enum" __ String _ "{" _ (AutoEnumProp __):* "}" 
    {% 
    (d) => ({
      type: 'autoEnum',
      name: d[2],
      props: d[6].flat().filter(Boolean).map(p => ({ prop: p }))
    })
    %}

  # "Numeric enum" variant

| "enum" __ String _ "{" _ (NumEnumProp __):* "}" 
    {% 
    (d) => ({
      type: 'numEnum',
      name: d[2],
      props: d[6].flat().filter(Boolean)
    })
    %}
  
  # "String enum" variant

| "enum" __ String _ "{" _ (StringEnumProp __):* "}" 
    {% 
    (d) => ({
      type: 'strEnum',
      name: d[2],
      props: d[6].flat().filter(Boolean)
    })
    %}

AutoEnumProp -> String {% introspect %}

NumEnumProp -> String _ "=" _ Number {% (d) => ({ prop: d[0], value: d[4] }) %}

StringEnumProp -> String _ "=" _ String {% (d) => ({ prop: d[0], value: d[4] }) %}