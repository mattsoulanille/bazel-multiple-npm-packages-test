import { foo } from '@test_multiple_packages/foo/foo';

export function bar() {
    return `Bar calling foo. Foo says: '${foo()}'.`;
}
