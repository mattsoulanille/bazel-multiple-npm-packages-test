import 'jasmine';
import {bar} from './bar';

describe('bar', () => {
  it('this test should pass', () => {
    expect(bar()).toEqual(
      "Bar calling foo. Foo says: 'Foo bla bla bla'."
    );
  });
});
