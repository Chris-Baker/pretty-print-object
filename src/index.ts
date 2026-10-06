interface PrettyPrintOptions {
    /**
     * Preferred indentation.
     *
     * @default '\t'
     */
    indent?: string;

    /**
     * Set to false to get double-quoted strings.
     *
     * @default true
     */
    singleQuotes?: boolean;

    /**
     * Whether to include the property prop of the object obj in the output.
     *
     * @param obj
     * @param prop
     */
    filter?: (obj: any, prop: string | symbol | number) => boolean;

    /**
     * Expected to return a string that transforms the string that resulted from stringifying obj[prop].
     * This can be used to detect special types of objects that need to be stringified in a particular way.
     * The transform function might return an alternate string in this case, otherwise returning the originalResult.
     *
     * @param obj
     * @param prop
     * @param originalResult
     */
    transform?: (obj: any, prop: string | symbol | number, originalResult: string) => string;

    /**
     * When set, will inline values up to inlineCharacterLimit length for the sake of more terse output.
     */
    inlineCharacterLimit?: number
}

const seen: any[] = [];

/**
 * Check if a value is an object or a function. Keep in mind that array, function, regexp, etc, are objects in JavaScript.
 *
 * @param value the value to check
 * @return true if the value is an object or a function
 */
function isObj(value: any) {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
}

/**
 * Check if a value is a regular expression.
 *
 * @param value the value to check
 * @return true if the value is a regular expression
 */
function isRegexp(value: any) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}

/**
 * Get an array of all of the enumerable symbols for an object.
 *
 * @param object the object to get the enumerable symbols for
 */
function getOwnEnumPropSymbols(object: object): symbol[] {
    return Object.getOwnPropertySymbols(object).filter((keySymbol): boolean => Object.prototype.propertyIsEnumerable.call(object, keySymbol));
}

export function prettyPrint(input: any): string;
export function prettyPrint(input: any, options: PrettyPrintOptions): string;
export function prettyPrint(input: any, options: PrettyPrintOptions, pad: string): string;

/**
 * pretty print an object
 *
 * @param input the object to pretty print
 * @param options the formatting options, transforms, and filters
 * @param pad the padding string
 */
export function prettyPrint(input: any, options?: PrettyPrintOptions, pad: string = ''): string {

    // sensible option defaults
    const defaultOptions: PrettyPrintOptions = {
        indent: '\t',
        singleQuotes: true
    };

    const combinedOptions = {...defaultOptions, ...options};

    let tokens: {[key: string]: string};

    if (combinedOptions.inlineCharacterLimit === undefined) {
        tokens = {
            newLine:        '\n',
            newLineOrSpace: '\n',
            pad:            pad,
            indent:         pad + combinedOptions.indent
        };
    } else {
        tokens = {
            newLine:        '@@__PRETTY_PRINT_NEW_LINE__@@',
            newLineOrSpace: '@@__PRETTY_PRINT_NEW_LINE_OR_SPACE__@@',
            pad:            '@@__PRETTY_PRINT_PAD__@@',
            indent:         '@@__PRETTY_PRINT_INDENT__@@'
        };
    }

    const expandWhiteSpace = (string: string) => {
        if (combinedOptions.inlineCharacterLimit === undefined) {
            return string;
        }

        const oneLined = string
            .replace(new RegExp(tokens.newLine, 'g'), '')
            .replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ')
            .replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');

        if (oneLined.length <= combinedOptions.inlineCharacterLimit) {
            return oneLined;
        }

        return string
            .replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n')
            .replace(new RegExp(tokens.pad, 'g'), pad)
            .replace(new RegExp(tokens.indent, 'g'), pad + combinedOptions.indent);
    };

    if (seen.indexOf(input) !== -1) {
        return '"[Circular]"';
    }

    if (input === null ||
        input === undefined ||
        typeof input === 'number' ||
        typeof input === 'boolean' ||
        typeof input === 'function' ||
        typeof input === 'symbol' ||
        isRegexp(input)
    ) {
        return String(input);
    }

    if (input instanceof Date) {
        if (Number.isNaN(input.getTime())) {
            return `Invalid Date`;
        } else {
            return `new Date('${input.toISOString()}')`;
        }
    }

    if (Array.isArray(input)) {
        if (input.length === 0) {
            return '[]';
        }

        seen.push(input);

        const ret = '[' + tokens.newLine + input.map((el, i) => {
            const eol = input.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;

            let value = prettyPrint(el, combinedOptions, pad + combinedOptions.indent);
            if (combinedOptions.transform) {
                value = combinedOptions.transform(input, i, value);
            }

            return tokens.indent + value + eol;
        }).join('') + tokens.pad + ']';

        seen.pop();

        return expandWhiteSpace(ret);
    }

    if (isObj(input)) {
        let objKeys = [...Object.keys(input), ...(getOwnEnumPropSymbols(input))];

        if (combinedOptions.filter) {
            objKeys = objKeys.filter(el => combinedOptions.filter && combinedOptions.filter(input, el));
        }

        if (objKeys.length === 0) {
            return '{}';
        }

        seen.push(input);

        const ret = '{' + tokens.newLine + objKeys.map((el, i) => {
            const eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
            const isSymbol = typeof el === 'symbol';
            const isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el.toString());
            const key = isSymbol || isClassic ? el : prettyPrint(el, combinedOptions);

            let value = prettyPrint(input[el], combinedOptions, pad + combinedOptions.indent);
            if (combinedOptions.transform) {
                value = combinedOptions.transform(input, el, value);
            }

            return tokens.indent + String(key) + ': ' + value + eol;
        }).join('') + tokens.pad + '}';

        seen.pop();

        return expandWhiteSpace(ret);
    }

    input = String(input).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r');

    if (!combinedOptions.singleQuotes) {
        input = input.replace(/"/g, '\\"');
        return `"${input}"`;
    }

    input = input.replace(/\\?'/g, '\\\'');
    return `'${input}'`;
}
