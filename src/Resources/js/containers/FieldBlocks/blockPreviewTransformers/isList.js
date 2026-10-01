// @flow

// Works for plain arrays and for observable arrays of every mobx version (mobx 4 observable arrays are not
// real arrays, and mobx 6 dropped isArrayLike), without importing mobx.
export default function isList(value: *): boolean {
    return !!value
        && typeof value === 'object'
        && typeof value.length === 'number'
        && typeof value.map === 'function';
}
