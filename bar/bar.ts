import {foo} from '@test_scoped_repo/foo/foo';

export function bar() {
  return `Bar calling foo. Foo says: '${foo()}'.`;
}
