module.exports = class CppCommon {
  static getPropTypeRecursive(prop) {
    if(prop === "any") {
      console.log(`${prop.prop}: any not yet supported`);
      return '';
    }

    if(prop === "string") {
      return 'std::string';
    }

    if(prop === "boolean") {
      return 'bool';
    }

    if(prop.literal && prop.literal.startsWith("Array")) {
      return `std::vector<${CppCommon.getPropTypeRecursive(prop.inner)}>`;
    }

    if(prop.literal && prop.literal === "Record") {
      return `std::tuple<${CppCommon.getPropTypeRecursive(prop.left)}, ${CppCommon.getPropTypeRecursive(prop.right)}>`;
    }

    if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double"].indexOf(prop) > -1) {
      return `${prop}`;
    }

    return '';
  }

  static getPropType(prop, allowOptionals = true) {
    let newResult = '';

    if(prop.typeInfo === "any") {
      console.log(`${prop.prop}: any not yet supported`);
    }

    if(prop.typeInfo === "string") {
      if(prop.optional && allowOptionals) {
        newResult += `std::optional<std::string>`;
      } else {
        newResult += `std::string`;
      }
    }

    if(prop.typeInfo === "boolean") {
      if(prop.optional && allowOptionals) {
        newResult += `std::optional<bool>`;
      } else {
        newResult += `bool`;
      }
    }

    if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Array")) {
      if(prop.optional && allowOptionals) {
        newResult += `std::optional<std::vector<${CppCommon.getPropTypeRecursive(prop.typeInfo.inner)}>>`;
      } else {
        newResult += `std::vector<${CppCommon.getPropTypeRecursive(prop.typeInfo.inner)}>`;
      }
    }

    if(prop.typeInfo.literal && prop.typeInfo.literal.startsWith("Record")) {
      console.log(`${prop.prop}: records not supported`);
      // although classes/structs with records can be generated, let's not pretend they're useful in C++.
      // if(prop.optional && allowOptionals) {
      //   newResult += `std::optional<std::tuple<${CppCommon.getPropTypeRecursive(prop.typeInfo.left)}, ${CppCommon.getPropTypeRecursive(prop.typeInfo.right)}>>`;
      // } else {
      //   newResult += `std::tuple<${CppCommon.getPropTypeRecursive(prop.typeInfo.left)}, ${CppCommon.getPropTypeRecursive(prop.typeInfo.right)}>`;
      // }
    }

    if(["int64_t", "uint64_t", "int32_t", "uint32_t", "float", "double"].indexOf(prop.typeInfo) > -1) {
      if(prop.optional && allowOptionals) {
        newResult += `std::optional<${prop.typeInfo}>`;
      } else {
        newResult += `${prop.typeInfo}`;
      }
    }

    return newResult;
  }
}