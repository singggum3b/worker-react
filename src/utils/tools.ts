export function copyFields<T>(target: T, source: Readonly<Partial<T>>): T {
    for (const id in source) {
        if (source.hasOwnProperty(id)) {
            target[id] = source[id] as any;
        }
    }
    return target;
}
