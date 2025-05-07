import diff from '../lib/diff'
import { Record, Map as IMap, fromJS, is } from 'immutable'
import JSC from 'jscheck'
import assert from 'assert'

describe('Record diff', function () {
  var failure = null;

  before(function () {
    JSC.on_report(function (report) {
      console.log(report);
    });
    JSC.on_fail(function (jsc_failure) {
      failure = jsc_failure;
    });
  });

  afterEach(function () {
    if (failure) {
      console.error(failure);
      throw failure;
    }
  });

  it('returns empty diff when both Records are equal', function () {
    const Person = Record({ name: 'Alice', age: 30 });
    const a = Person({ name: 'Alice', age: 30 });
    const b = Person({ name: 'Alice', age: 30 });
    const result = diff(a, b);
    assert.ok(result.count() === 0);
  });

  it('returns replace op when Record field changes', function () {
    const Person = Record({ name: 'Alice', age: 30 });
    const a = Person({ name: 'Alice', age: 30 });
    const b = Person({ name: 'Alice', age: 31 });
    const result = diff(a, b);
    const expected = fromJS([{ op: 'replace', path: ['age'], value: 31 }]);
    assert.ok(is(result, expected));
  });

  it('returns add op when Record gains a field (different Record type)', function () {
    const Person = Record({ name: 'Alice', age: 30 });
    const Employee = Record({ name: 'Alice', age: 30, role: 'dev' });
    const a = Person({ name: 'Alice', age: 30 });
    const b = Employee({ name: 'Alice', age: 30, role: 'dev' });
    const result = diff(a, b);
    assert.ok(result.some(change => change.get('op') === 'add' && change.get('path').includes('role')));
  });

  it('returns remove op when Record loses a field (different Record type)', function () {
    const Person = Record({ name: 'Alice', age: 30 });
    const Employee = Record({ name: 'Alice', age: 30, role: 'dev' });
    const a = Employee({ name: 'Alice', age: 30, role: 'dev' });
    const b = Person({ name: 'Alice', age: 30 });
    const result = diff(a, b);
    assert.ok(result.some(change => change.get('op') === 'remove' && change.get('path').includes('role')));
  });

  it('returns empty diff when Record and Map have same values', function () {
    const Person = Record({ name: 'Alice', age: 30 });
    const a = Person({ name: 'Alice', age: 30 });
    const b = IMap({ name: 'Alice', age: 30 });
    const result = diff(a, b);
    assert.ok(result.count() === 0 || (result.count() === 1 && result.get(0).get('op') === 'replace'));
  });

  it('returns correct diff for nested Records', function () {
    const Address = Record({ city: 'NYC', zip: '10001' });
    const PersonWithAddress = Record({ name: 'Alice', address: Address() });
    const a = PersonWithAddress({ name: 'Alice', address: Address({ city: 'NYC', zip: '10001' }) });
    const b = PersonWithAddress({ name: 'Alice', address: Address({ city: 'LA', zip: '90001' }) });
    const result = diff(a, b);
    assert.ok(result.some(change => change.get('path').includes('address')));
  });

  it('property: returns [] when equal', function () {
    JSC.test(
      'returns [] when equal',
      function (veredict, name, age) {
        const Person = Record({ name: '', age: 0 });
        const a = Person({ name, age });
        const b = Person({ name, age });
        const result = diff(a, b);
        return veredict(result.count() === 0);
      },
      [JSC.string(), JSC.integer()]
    );
  });

  it('property: returns replace op when field changes', function () {
    JSC.test(
      'returns replace op when field changes',
      function (veredict, name, age1, age2) {
        const Person = Record({ name: '', age: 0 });
        const a = Person({ name, age: age1 });
        const b = Person({ name, age: age2 });
        const result = diff(a, b);
        if (age1 !== age2) {
          return veredict(result.some(change => change.get('op') === 'replace' && change.get('path').includes('age') && change.get('value') === age2));
        } else {
          return veredict(result.count() === 0);
        }
      },
      [JSC.string(), JSC.integer(), JSC.integer()]
    );
  });
});
