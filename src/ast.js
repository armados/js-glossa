"use strict";
const util = require("util");

class ASTree {
  constructor(result) {
    this.result = result;
  }

  generate() {
    const entities = new Map();

    this.addReachableEntities(this.result, entities);

    var myTree = [...entities]
      .map(([node, index]) => this.detailLine(node, index, entities))
      .join("\n");

    return myTree;
  }

  addReachableEntities(node, entities) {
    if (node === null || typeof node !== "object" || entities.has(node)) {
      return;
    }

    entities.set(node, entities.size);

    Object.values(node).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach((n) => this.addReachableEntities(n, entities));
      } else {
        this.addReachableEntities(value, entities);
      }
    });
  }

  ref(value, entities) {
    if (value === undefined || typeof value === "function") {
      return undefined;
    } else if (Array.isArray(value)) {
      return `[${value.map((v) => this.ref(v, entities))}]`;
    } else if (typeof value === "object" && value !== null) {
      return `#${entities.get(value)}`;
    }
    return util.inspect(value);
  }

  detailLine(node, index, entities) {
    let line = `id: ${index} object: ${node.constructor.name}`;

    Object.keys(node).forEach((key) => {
      const val = this.ref(node[key], entities);

      line += node.constructor.name;
      line += val === undefined ? "" : `  ${key}=${val} `;
    });

    return line;
  }
}

module.exports = {
  ASTree,
};
