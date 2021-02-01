import 'jasmine';
import {foo} from './foo';

describe('foo', () => {
  it('this test should fail', () => {
    expect(foo()).toEqual('wrong string');
  });
});
