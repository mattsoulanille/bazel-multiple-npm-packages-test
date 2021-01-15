import {foo} from '@tests/foo/foo';

export function bar() {
  return `Bar calling foo. Foo says: '${foo()}'.`;
}
