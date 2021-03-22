"use strict";
//FIXME: const util = require("util");

const OBJ = require("./objects");


class ASTree {
  constructor(result) {
    this.result = result;
  }

  generate() {
    const entities = new Map();

    this.addReachableEntities(this.result, entities);

    console.log(entities);
    
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
    //FIXME: return util.inspect(value);
  }

  
  refB(value, entities) {
    if (value === undefined || typeof value === "function") {
      return undefined;
    } else if (typeof value === "Stmt_Write") {
      return "ΓΡΑΨΕ"
    }
return "";
    

    if (value === undefined || typeof value === "function") {
      return undefined;
    } else if (Array.isArray(value)) {
      return `RefBisArray [${value.map((v) => this.refB(v, entities))}]`;
    } else if (typeof value === "object" && value !== null) {
      return `RefBisObject#${entities.get(value)}`;
    }
    return 'what??';
    //FIXME: return util.inspect(value);
  }

  detailLine(node, index, entities) {
    let line = `id: ${index} object: ${node.constructor.name}`;


   // if (node instanceof OBJ.Stmt_Write) console.log (node);


    let param ='';


    Object.keys(node).forEach((key) => {
      const val = this.ref(node[key], entities);      
      param += val === undefined ? "" : `  ${key}=${val} `;
    });

    if (node instanceof OBJ.Stmt_Write) {
            return "ΓΡΑΨΕ" +param
    } else if (node instanceof OBJ.Stmt_Read) {
      return "ΔΙΑΒΑΣΕ" +param
    } else if (node instanceof OBJ.Stmt_For) {
      return "ΓΙΑ" +param
    } 

    return line + param;
  }
}

module.exports = {
  ASTree,
};
