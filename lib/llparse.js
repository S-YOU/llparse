'use strict';

const internal = require('./llparse/');

// API, really

class LLParse {
  constructor(prefix) {
    this.prefix = prefix || 'llparse';
  }

  static create(prefix) {
    return new LLParse(prefix);
  }

  node(name) {
    return new internal.node.Node(name);
  }

  error(code, reason) {
    return new internal.node.Error(code, reason);
  }

  invoke(name, map, otherwise) {
    return new internal.node.Invoke(name, map, otherwise);
  }

  skip() {
    return new internal.node.Skip();
  }

  build(root) {
    const c = new internal.Compiler(this.prefix);
    return c.build(root);
  }
}
module.exports = LLParse;