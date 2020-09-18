
### Helpers
@{% function nuller() { return null; } %}
@{% function emptystring() { return ''; } %}
@{% function number(d) { return +d[0].join(''); } %}
@{% function joiner(d) { return d.flat().join(''); } %}
@{% function introspect(d) { return d[0]; } %}
@{% function flat(d) { return d.flat(Infinity); } %}
@{% function compact(d) { return d.filter(Boolean); } %}
@{% function compactFlat(d) { return d.filter(Boolean).flat(Infinity); } %}

### Primitives

# Optional Whitespace
_ -> [\s\n\t]:* {% nuller %}

# Mandatory Whitespace
__ -> [\s\n\t]:+ {% nuller %}

Number -> [0-9]:+ {% number %}
String -> [a-zA-Z]:+ {% joiner %}