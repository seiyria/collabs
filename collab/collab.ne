
@include "_primitives.ne"
@include "enum.ne"
@include "interface.ne"

main -> _ (Container _):* {% compactFlat %}

Container -> 
  Enum {% compactFlat %}
| Interface {% compactFlat %}
