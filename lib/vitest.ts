
// Browser-compatible mini-Vitest implementation

type TestFn = () => void | Promise<void>;
type DescribeFn = (name: string, fn: () => void) => void;

interface TestResult {
    suite: string;
    name: string;
    status: 'pass' | 'fail';
    error?: any;
}

export const results: TestResult[] = [];
let currentSuite = "Global";

// Registry to track spies
const spies = new Set<any>();

// Store beforeEach callbacks per suite
const suiteBeforeEach = new Map<string, Array<() => void>>();

// Queue for tests
const testQueue: Array<{name: string, suite: string, fn: TestFn}> = [];

export const describe: DescribeFn = (name, fn) => {
    const prevSuite = currentSuite;
    currentSuite = name;
    try {
        fn();
    } finally {
        currentSuite = prevSuite;
    }
};

export const it = (name: string, fn: TestFn) => {
    testQueue.push({ suite: currentSuite, name, fn });
};

export const beforeEach = (fn: () => void) => {
    if (!suiteBeforeEach.has(currentSuite)) {
        suiteBeforeEach.set(currentSuite, []);
    }
    suiteBeforeEach.get(currentSuite)!.push(fn);
};

// --- Mocks & Spies ---

export const vi = {
    fn: (impl?: (...args: any[]) => any) => {
        const spy = (...args: any[]) => {
            spy.calls.push(args);
            return impl ? impl(...args) : undefined;
        };
        spy.calls = [] as any[][];
        spy.mockResolvedValue = (val: any) => {
            impl = () => Promise.resolve(val);
        };
        spy.mockRejectedValue = (val: any) => {
            impl = () => Promise.reject(val);
        };
        spy.mockImplementation = (newImpl: any) => {
            impl = newImpl;
        }
        spies.add(spy);
        return spy;
    },
    mock: (moduleName: string, factory?: any) => {
        console.warn(`vi.mock('${moduleName}') called. Module mocking is not supported in the browser runner. Please use dependency injection.`);
    },
    clearAllMocks: () => {
        spies.forEach(spy => {
            spy.calls = [];
        });
    }
};

// --- Matchers ---

const isEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a === 'object' && a !== null && b !== null) {
        if (Array.isArray(a) !== Array.isArray(b)) return false;
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => isEqual(a[key], b[key]));
    }
    return false;
};

export const expect = (actual: any) => {
    return {
        toBe: (expected: any) => {
            if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
        },
        toEqual: (expected: any) => {
            if (!isEqual(actual, expected)) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        },
        toBeGreaterThan: (expected: number) => {
            if (!(actual > expected)) throw new Error(`Expected ${actual} to be greater than ${expected}`);
        },
        toBeGreaterThanOrEqual: (expected: number) => {
            if (!(actual >= expected)) throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
        },
        toBeUndefined: () => {
             if (actual !== undefined) throw new Error(`Expected undefined but got ${actual}`);
        },
        toHaveBeenCalled: () => {
            if (!actual.calls || actual.calls.length === 0) throw new Error("Expected spy to have been called");
        },
        toHaveBeenCalledWith: (...args: any[]) => {
            if (!actual.calls || actual.calls.length === 0) throw new Error("Expected spy to have been called");
             // Simple check for last call or any call
            const called = actual.calls.some((callArgs: any[]) => {
                // simple arg match or string match for loose comparison
                return isEqual(callArgs, args) || JSON.stringify(callArgs).includes(args[0]?.toString()); 
            });
            
            if(!called) {
                // Allow stringContaining logic via manual check if needed
                 const match = actual.calls.some((callArgs: any[]) => {
                     return callArgs.every((arg, i) => {
                         if (typeof args[i] === 'object' && args[i].__stringContaining) {
                             return arg.includes(args[i].val);
                         }
                         if (typeof args[i] === 'object' && args[i].__objectContaining) {
                             // basic partial match
                             if (typeof arg !== 'object' || arg === null) return false;
                             return Object.keys(args[i].val).every(k => isEqual(arg[k], args[i].val[k]));
                         }
                         return isEqual(arg, args[i]);
                     })
                 })
                 if (!match) throw new Error(`Expected spy to be called with ${JSON.stringify(args)}`);
            }
        },
        rejects: {
            toThrow: async (msg?: string) => {
                try {
                    await actual;
                    throw new Error("Expected promise to reject");
                } catch (e: any) {
                    if (msg && !e.message.includes(msg)) {
                        throw new Error(`Expected error containing "${msg}" but got "${e.message}"`);
                    }
                }
            }
        }
    };
};

// Assign static methods to expect
expect.stringContaining = (str: string) => ({ __stringContaining: true, val: str });
expect.objectContaining = (obj: any) => ({ __objectContaining: true, val: obj });

export const executeRegistered = async () => {
    results.length = 0;
    
    for (const test of testQueue) {
         // Run beforeEach for this suite (and "Global" if we tracked it, but we kept it simple)
        const befores = suiteBeforeEach.get(test.suite) || [];
        for (const cb of befores) {
            cb();
        }
        
        // Also run Global beforeEach if any (captured during 'describe' of Global or outside describe)
        if (test.suite !== "Global") {
             const globalBefores = suiteBeforeEach.get("Global") || [];
             for (const cb of globalBefores) {
                cb();
            }
        }

        try {
            const res = test.fn();
            if (res instanceof Promise) await res;
            results.push({ suite: test.suite, name: test.name, status: 'pass' });
        } catch (e) {
            console.error(e);
            results.push({ suite: test.suite, name: test.name, status: 'fail', error: e });
        }
    }
    return results;
}
