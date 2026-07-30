// Ambient module declarations for Node.js built-in modules used by tests.
// These exist because @types/node is not installed in this environment's
// dependency set; the shims cover exactly the surface used by
// src/math/sum.test.ts (node:test and node:assert) so `tsc` can type-check
// and compile the project without requiring an external types package.

declare module 'node:test' {
  type TestFn = () => void | Promise<void>;
  export function test(name: string, fn: TestFn): void;
  export default function test(name: string, fn: TestFn): void;
}

declare module 'node:assert' {
  interface Assert {
    strictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
    throws(fn: () => unknown, error?: unknown, message?: string | Error): void;
  }
  const assert: Assert;
  export default assert;
}
