export function arrayJoin<A extends object, B extends object>(arr1: A[], arr2: B[]) {
  const api = {
    prop1: null,
    prop2: null,

    deepEqual() {
      return arr1.map((arr1Element) => ({
        ...arr2.find((arr2Element) => arr1Element[this.prop1] === (arr2Element[this.prop2] as any)),
        ...arr1Element,
      }));
    },

    on(prop1: keyof A, prop2: keyof B): (A & B)[] {
      this.prop1 = prop1;
      this.prop2 = prop2;
      return this.deepEqual();
    },
  };

  return api;
}
