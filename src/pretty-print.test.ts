/** @format */
import { prettyPrint } from "./";

describe('Pretty print object', () => {
    test('should pretty print a simple object', () => {
        expect(prettyPrint({foo: 'a \' b \' c \\\' d'}, {singleQuotes: true}))
            .toBe('{\n\tfoo: \'a \\\' b \\\' c \\\' d\'\n}');
    });

    test('should pretty print a simple object and create a snapshot', () => {
        expect(prettyPrint({foo: 'a \' b \' c \\\' d'}, {singleQuotes: true}))
            .toMatchSnapshot();
    });

    test('should pretty print a complex object', () => {
        /* eslint-disable quotes, object-shorthand */
        const obj: any = {
            foo: 'bar \'bar\'',
            foo2: [
                'foo',
                'bar',
                {
                    foo: "bar 'bar'"
                }
            ],
            'foo-foo': 'bar',
            '2foo': 'bar',
            '@#': "bar",
            $el: 'bar',
            _private: 'bar',
            number: 1,
            boolean: true,
            date: new Date("2014-01-29T22:41:05.665Z"),
            escapedString: "\"\"",
            null: null,
            undefined: undefined,
            fn: function fn() {}, // eslint-disable-line func-names
            regexp: /./,
            NaN: NaN,
            Infinity: Infinity,
            newlines: "foo\nbar\r\nbaz",
            [Symbol()]: Symbol(), // eslint-disable-line symbol-description
            [Symbol('foo')]: Symbol('foo'),
            [Symbol.for('foo')]: Symbol.for('foo')
        };
        /* eslint-enable */

        obj.circular = obj;

        const actual = prettyPrint(obj, {
            indent: '  ',
            singleQuotes: false
        });

        expect(actual).toMatchSnapshot();
    });

    test('should detect reused object values as circular reference', () => {
        const val = {val: 10};
        const obj = {foo: val, bar: val};
        expect(prettyPrint(obj)).toBe('{\n\tfoo: {\n\t\tval: 10\n\t},\n\tbar: {\n\t\tval: 10\n\t}\n}');
    });

    test('should detect reused array values as false circular references', () => {
        const val = [10];
        const obj = {foo: val, bar: val};
        expect(prettyPrint(obj)).toBe('{\n\tfoo: [\n\t\t10\n\t],\n\tbar: [\n\t\t10\n\t]\n}');
    });

    test('should filter a prop from the result', () => {
        const val = {val: 10};
        const obj = {foo: val, bar: val};
        const actual = prettyPrint(obj, {
            filter: (obj, prop) => prop !== 'foo'
        });
        expect(actual).toBe('{\n\tbar: {\n\t\tval: 10\n\t}\n}');
    });

    test('should transform the result', () => {
        const obj = {
            foo: {
                val: 10
            },
            bar: 9,
            baz: [8]
        };
        const actual = prettyPrint(obj, {
            transform: (obj, prop, result) => {
                if (prop === 'val') {
                    return String(obj[prop] + 1);
                }
                if (prop === 'bar') {
                    return '\'' + result + 'L\'';
                }
                if (obj[prop] === 8) {
                    return 'LOL';
                }
                return result;
            }
        });
        expect(actual).toBe('{\n\tfoo: {\n\t\tval: 11\n\t},\n\tbar: \'9L\',\n\tbaz: [\n\t\tLOL\n\t]\n}');
    });

    test('should handle circular references in arrays', () => {
        const array2: any[] = [];
        const array = [array2];
        array2[0] = array2;

        expect(() => {
            prettyPrint(array);
        }).not.toThrow();
    });

    test('should pretty print complex circular arrays', () => {
        const array: any[] = [[[]]];
        array[0].push(array);
        array[0][0].push(array);
        array[0][0].push(10);
        array[0][0][0] = array;
        expect(prettyPrint(array)).toBe('[\n\t[\n\t\t[\n\t\t\t"[Circular]",\n\t\t\t10\n\t\t],\n\t\t"[Circular]"\n\t]\n]');
    });

    test('allows short objects to be one-lined', () => {
        const object = {id: 8, name: 'Jane'};
        expect(prettyPrint(object)).toBe('{\n\tid: 8,\n\tname: \'Jane\'\n}');
        expect(prettyPrint(object, {inlineCharacterLimit: 21})).toBe('{id: 8, name: \'Jane\'}');
        expect(prettyPrint(object, {inlineCharacterLimit: 20})).toBe('{\n\tid: 8,\n\tname: \'Jane\'\n}');
    });

    test('does not mess up indents for complex objects', () => {
        const object = {
            arr: [1, 2, 3],
            nested: {hello: 'world'}
        };
        expect(prettyPrint(object)).toBe('{\n\tarr: [\n\t\t1,\n\t\t2,\n\t\t3\n\t],\n\tnested: {\n\t\thello: \'world\'\n\t}\n}');
        expect(prettyPrint(object, {inlineCharacterLimit: 12})).toBe('{\n\tarr: [1, 2, 3],\n\tnested: {\n\t\thello: \'world\'\n\t}\n}');
    });

    test('should not pretty print non-enumerable symbols', () => {
        const obj = {
            [Symbol('for enumerable key')]: undefined
        };
        const symbol = Symbol('for non-enumerable key');
        Object.defineProperty(obj, symbol, {enumerable: false});
        expect(prettyPrint(obj)).toBe('{\n\tSymbol(for enumerable key): undefined\n}');
    });

    test('should pretty print valid date', () => {
        const date = new Date('2019-01-01T00:00:00Z');
        expect(prettyPrint(date)).toBe(`new Date('2019-01-01T00:00:00.000Z')`);
    })

    test('not throw an error if date is invalid', () => {
        const date = new Date('undefined');
        expect(prettyPrint(date)).toBe('Invalid Date');
    })

    test('handles empty input', () => {
        expect(prettyPrint([])).toBe('[]');
        expect(prettyPrint({})).toBe('{}');
    });
});
