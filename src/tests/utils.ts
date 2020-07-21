const flatten = require('keypather/flatten');
const expand = require('keypather/expand');
const wild = require('wild');

export function stripProperties(
    data: object,
    pathWildcard: string,
    replacement: any = '[DELETED]'
): object {
    const flat = flatten(data);
    const regex = <RegExp>wild(pathWildcard);
    for (const [key, value] of Object.entries(flat)) {
        if (regex.test(key)) {
            flat[key] = replacement;
        }
    }
    return expand(flat);
}
