const Output = require('./output')
const CppCommon = require('./cppcommon')

const generateSerializerRecursively = function(indent, varname, prop) {
    let newResult = '';

    if(prop === "any") {
        console.log(`${prop}: any not yet supported`);
    }

    else if(prop === "string") {
        newResult += `${indent}    writer.String(${varname}.c_str(), ${varname}.size());\n`;
    }

    else if(prop === "boolean") {
        newResult += `${indent}    writer.Bool(${varname});\n`;
    }

    else if(prop === "int64_t") {
        newResult += `${indent}    writer.Int64(${varname});\n`;
    }

    else if(prop === "uint64_t") {
        newResult += `${indent}    writer.Uint64(${varname});\n`;
    }

    else if(prop === "int32_t") {
        newResult += `${indent}    writer.Int32(${varname});\n`;
    }

    else if(prop === "uint32_t") {
        newResult += `${indent}    writer.Uint32(${varname});\n`;
    }

    else if(prop === "float" || prop === "double") {
        newResult += `${indent}    writer.Double(${varname});\n`;
    }

    else if(prop.literal && prop.literal.startsWith("Array")) {
        newResult += `${indent}    writer.StartArray();\n`;
        newResult += `${indent}    for(auto const &${varname}val : ${varname}) {\n`;
        newResult += generateSerializerRecursively(indent + '    ', varname + 'val', prop.inner);
        newResult += `${indent}    }\n`;
        newResult += `${indent}    writer.EndArray();\n`;
    }

    else if(prop.literal && prop.literal.startsWith("Record")) {
        // newResult += `${indent}    writer.StartObject();\n`;
        // newResult += `${indent}    {\n`;
        // newResult += `${indent}    auto const& [left${varname}, right${varname}] = ${varname};\n\n`;
        // newResult += `${indent}    writer.String("left");\n`;
        // newResult += generateSerializerRecursively(indent, `left${varname}`, prop.typeInfo.left);
        // newResult += `\n${indent}    writer.String("right");\n`;
        // newResult += generateSerializerRecursively(indent, `right${varname}`, prop.typeInfo.right);
        // newResult += `\n${indent}    writer.EndObject();\n\n`;
        // newResult += `${indent}    }\n`;
    }

    return newResult;
}

const generateSerializer = function(indent, prop) {
    let newResult = '';
    let propName = `msg->${prop.prop}`;
    // console.log(`prop: ${prop}, ${prop.typeInfo}, ${prop.typeInfo.literal}, ${["int64_t, uint64_t, int32_t, uint32_t, float, double"].indexOf(prop.typeInfo)}`);

    if(prop.optional) {
        newResult += `${indent}    if(${propName}) {\n`;
        indent += '    ';
        propName = `(*${propName})`;
    }

    if(prop.typeInfo === "any") {
        console.log(`${prop.prop}: any not yet supported`);
    }

    else if(prop.typeInfo === "string") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.String(${propName}.c_str(), ${propName}.size());\n`;
    }

    else if(prop.typeInfo === "boolean") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.Bool(${propName});\n`;
    }

    else if(prop.typeInfo === "int64_t") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.Int64(${propName});\n`;
    }

    else if(prop.typeInfo === "uint64_t") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.Uint64(${propName});\n`;
    }

    else if(prop.typeInfo === "int32_t") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.Int32(${propName});\n`;
    }

    else if(prop.typeInfo === "uint32_t") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.Uint32(${propName});\n`;
    }

    else if(prop.typeInfo === "float" || prop.typeInfo === "double") {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.Double(${propName});\n`;
    }

    else if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Array")) {
        newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        newResult += `${indent}    writer.StartArray();\n`;
        newResult += `${indent}    for(auto const &val : ${propName}) {\n`;
        newResult += generateSerializerRecursively(indent + '    ', 'val', prop.typeInfo.inner);
        newResult += `${indent}    }\n`;
        newResult += `${indent}    writer.EndArray();\n`;
    }

    else if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Record")) {
        console.log(`${prop.prop}: records not supported`);
        // console.log(`record: ${prop}`);
        //
        // newResult += `${indent}    writer.String("${prop.prop}", ${prop.prop.length});\n`;
        // newResult += `${indent}    writer.StartObject();\n`;
        // indent += '    ';
        // newResult += `${indent}{\n`;
        // newResult += `${indent}    auto const& [left, right] = ${propName};\n\n`;
        // newResult += `${indent}    writer.String("left", 4);\n`;
        // newResult += generateSerializerRecursively(indent, `left`, prop.typeInfo.left);
        // newResult += `\n${indent}    writer.String("right", 5);\n`;
        // newResult += generateSerializerRecursively(indent, `right`, prop.typeInfo.right);
        // newResult += `${indent}}\n`;
        // indent = indent.slice(0, -4);
        // newResult += `${indent}    writer.EndObject();\n`;
    }

    if(prop.optional) {
        newResult += `${indent}}\n\n`;
    } else {
        newResult += '\n';
    }

    return newResult;
}

const generateDeserializerErrorChecking = function(indent, prop) {
    let newResult = '';

    if(!prop.optional && !(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Record"))) {
        newResult += `${indent}    if(!d.HasMember("${prop.prop}")) {\n`;
        newResult += `${indent}        return nullptr;\n`;
        newResult += `${indent}    }\n`;
    }

    return newResult;
}

const generateDeserializerArraysRecordsRecursively = function(indent, arrname, varname, prop) {
    let newResult = '';

    if(prop.literal && prop.literal.startsWith("Array")) {
        newResult += `${indent}    ${CppCommon.getPropTypeRecursive(prop)} ${arrname}arr;\n`;
        newResult += `${indent}    ${arrname}val.reserve(${varname}.Size());\n`;
        newResult += `${indent}    for(auto const &${varname}val : ${varname}.GetArray()) {\n`;
        newResult += generateDeserializerArraysRecordsRecursively(indent + '    ', arrname + 'arr', varname + 'val', prop.inner);
        newResult += `${indent}    }\n`;
        newResult += `${indent}    ${arrname}.emplace_back(std::move(${arrname}arr));\n`;
    }

    else if(prop === "string") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetString());\n`;
    }

    else if(prop === "boolean") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetBool());\n`;
    }

    else if(prop === "int64_t") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetInt64());\n`;
    }

    else if(prop === "uint64_t") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetUint64());\n`;
    }

    else if(prop === "int32_t") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetInt());\n`;
    }

    else if(prop === "uint32_t") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetUint());\n`;
    }

    else if(prop === "float" || prop === "double") {
        newResult += `${indent}    ${arrname}.emplace_back(${varname}.GetDouble());\n`;
    }

    else if(prop.literal && prop.literal.startsWith("Record")) {
        console.log("Records are not supported");
    }

    return newResult;
}

const generateDeserializerArraysRecords = function(indent, prop) {
    let newResult = '';

    if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Array")) {
        newResult += `${indent}    ${CppCommon.getPropType(prop, false)} ${prop.prop};\n`;
        newResult += `${indent}    {\n`;
        indent += '    ';
        if(prop.optional) {
            newResult += `${indent}    if(d.HasMember("${prop.prop}")) {\n`;
            indent += '    ';
        }

        newResult += `${indent}    ${prop.prop}.reserve(d["${prop.prop}"].Size());\n`;
        newResult += `${indent}    for(auto const &val : d["${prop.prop}"].GetArray()) {\n`;
        newResult += generateDeserializerArraysRecordsRecursively(indent + '    ', prop.prop, 'val', prop.typeInfo.inner);
        newResult += `${indent}    }\n`;

        if(prop.optional) {
            newResult += `${indent}}\n`;
            indent = indent.slice(0, -4);
        }
        newResult += `${indent}}\n`;
    }

    else if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Record")) {
        // newResult += `${indent}    ${CppCommon.getPropType(prop)} ${prop.prop};\n`;
        // newResult += `${indent}    {\n`;
        // indent += '    ';
        // if(prop.optional) {
        //     newResult += `${indent}    if(d.HasMember("${prop.prop}")) {\n`;
        //     indent += '    ';
        // }
        //
        // newResult += `${indent}    for(auto const &val : d["${prop.prop}"].GetObject()) {\n`;
        // newResult += `${indent}        std::get<0>(${prop.prop}) = ${generateDeserializerArraysRecordsRecursively(indent + '    ', 'val', prop.typeInfo.left)}\n`;
        // newResult += `${indent}        std::get<1>(${prop.prop}) = ${generateDeserializerArraysRecordsRecursively(indent + '    ', 'val', prop.typeInfo.right)}\n`;
        // newResult += `${indent}    }\n`;
        //
        // if(prop.optional) {
        //     newResult += `${indent}}\n`;
        //     indent = indent.slice(0, -4);
        // }
        // newResult += `${indent}}\n`;
    }

    return newResult;
}

const generateDeserializerInstance = function(d, comma, prop) {
    let newResult = '';
    let propName = `${prop.prop}`;
    // console.log(`prop: ${prop}, ${prop.typeInfo}, ${prop.typeInfo.literal}, ${["int64_t, uint64_t, int32_t, uint32_t, float, double"].indexOf(prop.typeInfo)}`);

    if(prop.typeInfo === "any") {
        console.log(`${prop.prop}: any not yet supported`);
    }

    else if(prop.typeInfo === "string") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetString() : std::optional<std::string>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetString()`;
        }
    }

    else if(prop.typeInfo === "boolean") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetBool() : std::optional<bool>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetBool()`;
        }
    }

    else if(prop.typeInfo === "int64_t") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetInt64() : std::optional<${prop.typeInfo}>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetInt64()`;
        }
    }

    else if(prop.typeInfo === "uint64_t") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetUint64() : std::optional<${prop.typeInfo}>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetUint64()`;
        }
    }

    else if(prop.typeInfo === "int32_t") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetInt() : std::optional<${prop.typeInfo}>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetInt()`;
        }
    }

    else if(prop.typeInfo === "uint32_t") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetUint() : std::optional<${prop.typeInfo}>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetUint()`;
        }
    }

    else if(prop.typeInfo === "float" || prop.typeInfo === "double") {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? ${d}["${propName}"].GetString() : std::optional<${prop.typeInfo}>{}`;
        } else {
            newResult += `${comma}${d}["${propName}"].GetString()`;
        }
    }

    else if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Array")) {
        if(prop.optional) {
            newResult += `${comma}${d}.HasMember("${propName}") ? std::move(${propName}) : ${CppCommon.getPropType(prop)}{}`;
        } else {
            newResult += `${comma}std::move(${propName})`;
        }
    }

    else if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Record")) {
        // newResult += `${comma}std::move(${propName})`;
    }

    return newResult;
}

const generateHeader = function(name, includeFilename, namespace, props) {
    let contents = '\n';
    let indent = '';
    const className = `${name}Serializer`;
    if(namespace) {
        contents += 'namespace ' + namespace + ' {\n';
        indent = '    ';
    }

    contents += `${indent}struct ${className} final : public ISerializer, public Service {\n`;
    contents += `${indent}    ${className}(IchorProperties props) : Service(std::move(props)) {\n`;
    contents += `${indent}        _properties.insert({"type", typeNameHash<${name}>()});\n`;
    contents += `${indent}    }\n`;
    contents += `${indent}    ~${className}() final = default;\n`;
    contents += `\n`;
    contents += `${indent}    bool start() final {\n`;
    contents += `${indent}        return true;\n`;
    contents += `${indent}    }\n`;
    contents += `${indent}    bool stop() final {\n`;
    contents += `${indent}        return true;\n`;
    contents += `${indent}    }\n`;
    contents += `${indent}    std::vector<uint8_t> serialize(const void* obj) final {\n`;
    contents += `${indent}        auto msg = static_cast<const ${name}*>(obj);\n`;
    contents += `${indent}        rapidjson::StringBuffer sb;\n`;
    contents += `${indent}        rapidjson::Writer<rapidjson::StringBuffer> writer(sb);\n`;
    contents += `${indent}        writer.StartObject();\n\n`;

    for(const prop of props) {
        contents += generateSerializer(indent + '    ', prop);
    }

    contents += `${indent}        writer.EndObject();\n`;
    contents += `${indent}        auto *ret = sb.GetString();\n`;
    contents += `${indent}        return std::vector<uint8_t>(ret, ret + sb.GetSize() + 1);\n`;
    contents += `${indent}    }\n\n`;


    contents += `${indent}    void* deserialize(std::vector<uint8_t> &&stream) final {\n`;
    contents += `${indent}        rapidjson::Document d;\n`;
    contents += `${indent}        d.ParseInsitu(reinterpret_cast<char*>(stream.data()));\n\n`;
    contents += `${indent}        if(d.HasParseError()) {\n`;
    contents += `${indent}            LOG_ERROR(_logger, "stream not valid json");\n`;
    contents += `${indent}            return nullptr;\n`;
    contents += `${indent}        }\n`;

    for(const prop of props) {
        contents += generateDeserializerErrorChecking(indent + '    ', prop);
    }

    for(const prop of props) {
        contents += generateDeserializerArraysRecords(indent + '    ', prop);
    }

    contents += `${indent}        return new ${name}{`;

    let isFirst = true;
    for(const prop of props) {
        contents += generateDeserializerInstance('d', isFirst ? '' : ', ', prop);
        isFirst = false;
    }

    contents += `};\n`;

    contents += `${indent}    }\n`;
    contents += `${indent}}\n`;

    if(namespace) {
        contents += '}';
    }

    let top = `// GENERATED CONTENT
#pragma once
#include <ichor/DependencyManager.h>
#include <ichor/optional_bundles/logging_bundle/Logger.h>
#include <ichor/Service.h>
#include <ichor/optional_bundles/serialization_bundle/ISerializationAdmin.h>
#include <ichor/LifecycleManager.h>
#include "${includeFilename}.h"

#include <rapidjson/document.h>
#include <rapidjson/writer.h>

using namespace Ichor;\n`;
    return top + contents;
}

module.exports = (tokens, namespace, baseFilename) => {
  let files = [];

  for(const token of tokens) {
      if(token.type === 'interface') {
          files.push(new Output(token.name + 'Serializer.h', generateHeader(token.name, baseFilename, namespace, token.props)));
      }
  }

  return files;
};
