/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 */
export function deepFreeze<T>(object: T): T {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing self

    for (const name of propNames) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const value = object[name];

        if (value && typeof value === 'object') {
            deepFreeze(value as T);
        }
    }

    return Object.freeze(object);
}
