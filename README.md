
# Collabs

A tool to create cross-language enums and interfaces.

## Usage

`npx collabs`

## CLI Flags

* `--file` - the `.collab` file to parse
* `--baseFilename` - the destination file to output, without extension
* `--format` - the format of the file to parse as (supports `ts` only at this time)
* `--namespace` - the namespace within which the generated enums/interfaces are contained in. (optional)

## Supported Features

* Interface data types: `string`, `char`, `boolean`, `integer`, `float`, `any`, `Record<x, y>`, `Array<x>`
* Enum types: Bare enums, numerical enums, string enums
* Turn `.collab` files into any* language

_* only the languages in `formats/` are supported at this time_

## Examples

Check out the `examples` directory to see some simple examples.