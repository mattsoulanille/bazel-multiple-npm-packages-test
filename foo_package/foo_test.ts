import 'jasmine';
import { foo } from './foo';

describe('foo', () => {
    it('returns the correct result', () => {
        expect(foo()).toEqual('foo bla bla bla');
    });
});
