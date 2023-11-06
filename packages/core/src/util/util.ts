type promiseResolveCallback = (value: void) => void | PromiseLike<void>;
export function promiseResolveThen(fn: promiseResolveCallback) {
    Promise.resolve().then(fn);
}
