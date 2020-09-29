"use strict";

var MObjects = require("./objects");

const util = require('util');

class ASTree {
  constructor(result) {
    this.result = result;
  }

  generate() {

    const entities = new Map();

    this.addReachableEntities(this.result, entities);

    var myTree = [...entities]
      .map( ([node, index]) => this.detailLine(node, index, entities) )
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

      //if (node instanceof MObjects.WhileLoop) line += `Line Loop ${key}=${val}`;
        line += node.constructor.name;
        line += val === undefined ? '' : `  ${key}=${val} `;
/*  
      if (node instanceof MObjects.BinaryOp) 
        line += val === undefined ? '' : `BinaryOp ${key}=${val}`;
      else if (node instanceof MObjects.MBoolean) 
        line += val === undefined ? '' : `Boolean  ${key}=${val}`;
        else if (node instanceof MObjects.MSymbol) 
        line += val === undefined ? '' : `MSymbol  ${key}=${val}`;
    */
       });

    return line;
  }
}


module.exports = {
  ASTree: ASTree
}
