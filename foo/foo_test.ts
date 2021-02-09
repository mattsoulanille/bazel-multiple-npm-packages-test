import 'jasmine';
import {foo} from './foo';

describe('foo', () => {
  it('this test should pass', () => {
    expect(foo()).toEqual('Foo bla bla bla');
  });
});
