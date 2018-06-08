import * as assert from 'assert';
import * as frontend from 'llparse-frontend';

import { Compilation } from '../compilation';
import { ARG_POS, ARG_ENDPOS, ARG_STATE, STATE_PREFIX } from '../constants';

export interface INodeEdge {
  readonly node: frontend.IWrap<frontend.node.Node>;
  readonly noAdvance: boolean;
  readonly value?: number;
}

export abstract class Node<T extends frontend.node.Node> {
  protected cachedDecl: string | undefined;
  protected privCompilation: Compilation | undefined;

  constructor(public readonly ref: T) {
  }

  public build(compilation: Compilation): string {
    if (this.cachedDecl !== undefined) {
      return this.cachedDecl;
    }

    this.privCompilation = compilation;
    const out: string[] = [];
    this.doBuild(out);

    const res = STATE_PREFIX + this.ref.id.name;
    this.cachedDecl = res;

    compilation.addState(res, out);

    return res;
  }

  protected get compilation(): Compilation {
    assert(this.privCompilation !== undefined);
    return this.privCompilation!;
  }

  protected prologue(out: string[]): void {
    out.push(`if (${ARG_POS} == ${ARG_ENDPOS}) {`);

    const tmp: string[] = [];
    this.pause(tmp);
    tmp.forEach((line) => out.push(`  ${line}`));

    out.push('}');
  }

  protected pause(out: string[]): void {
    out.push(`${ARG_STATE}->_current = (void*) (intptr_t) ${this.cachedDecl};`);
    out.push('return 0;');
  }

  protected tailTo(out: string[], edge: INodeEdge): void {
    const ctx = this.compilation;
    const target = ctx.unwrapNode(edge.node).build(ctx);

    if (!edge.noAdvance) {
      out.push(`${ARG_POS}++;`);
    }
    out.push(`goto ${target};`);
  }

  protected abstract doBuild(out: string[]): void;
}