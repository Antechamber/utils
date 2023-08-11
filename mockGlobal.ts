type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];

type GlobalThisWritableProps = Pick<typeof globalThis, WritableKeys<typeof globalThis>>;

/**
 * Utility for mocking properties on the global object.
 *
 * API documentation:
 * * mockAsync(globalThisProperty): use to mock methods which return promises
 *   * resolve(): sets the mocked method to resolve when called
 *   * reject(): sets the mocked method to reject when called
 *   * mockReturnValue(value: any): sets the return value (whether resolved or rejected) for the mocked method
 */
export function mockGlobal() {
  const api = {
    /**
     * Mock async methods on global.
     *
     * @param globalThisProperty
     * @returns void
     *
     * @example <caption>replace fetch with jest mock</caption>
     * ```
     *  mockGlobal()
     *    .mockAsync('fetch')
     *    .resolve()
     *    .mockReturnValue({
     *      json: async () => Promise.resolve(mockData),
     *    });
     *
     * ```
     */
    mockAsync(globalThisProperty: keyof GlobalThisWritableProps) {
      let resolveOrReject: 'resolve' | 'reject' = 'resolve';
      let returnValue: any;

      const methods = {
        /**
         * Sets the mocked method to resolve when called
         */
        resolve() {
          resolveOrReject = 'resolve';
          global[globalThisProperty] = jest.fn(async () => Promise[resolveOrReject]()) as jest.Mock<
            Promise<void>
          > as never;
          return methods;
        },

        /**
         * Sets the mocked method to reject when called
         */
        reject() {
          resolveOrReject = 'reject';
          global[globalThisProperty] = jest.fn(async () => Promise[resolveOrReject]()) as jest.Mock<
            Promise<void>
          > as never;
          return methods;
        },

        /**
         * Sets the return value (whether resolved or rejected) for the mocked method
         */
        mockReturnValue(value: any) {
          returnValue = value;
          global[globalThisProperty] = jest.fn(async () => Promise[resolveOrReject](returnValue)) as jest.Mock<
            Promise<typeof returnValue>
          > as never;
          return methods;
        },
      };
      return methods;
    },

    /**
     * !!!Work in Progress!!! Mock synchronous methods on global.
     *
     * @param globalThisProperty
     * @returns void
     *
     * @example <caption>replace console with jest mock</caption>
     * ```
     *  mockGlobal()
     *    .mock('console')
     *    .mockReturnValue({
     *      ...global.console,
     *      log: () => {},
     *    });
     *
     * ```
     */
    mock(globalThisProperty: keyof GlobalThisWritableProps) {
      let mock: any = {};

      const methods = {
        mockReturnValue(value: any = null) {
          mock = jest.fn(value) as jest.Mock;
          global[globalThisProperty] = mock as never;
          return methods;
        },

        mockProperty(propertyName: string, value: any) {
          // type X = typeof global[propertyName]
          // type NestedWritableProps = Pick<typeof globalThis, WritableKeys<typeof globalThis>>
          global[globalThisProperty][propertyName] = value as jest.Mock;
        },
      };
      return methods;
    },
  };

  return api;
}
