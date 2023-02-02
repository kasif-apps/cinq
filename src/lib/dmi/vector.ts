import { CreateSliceOptions, Slice } from "../slice/slice";

export class VectorSlice<T extends unknown[]> extends Slice<T> {
  setAt(index: number, value: T[number]): void {
    this.set((state) => {
      const newValue = [...state] as T;
      newValue[index] = value;
      return newValue;
    });
  }

  push(value: T[number]): void {
    this.set((state) => [...state, value] as T);
  }

  pop(): void {
    this.set((state) => {
      const newValue = [...state] as T;
      newValue.pop();
      return newValue;
    });
  }

  shift(): void {
    this.set((state) => {
      const newValue = [...state] as T;
      newValue.shift();
      return newValue;
    });
  }

  unshift(value: T[number]): void {
    this.set((state) => [value, ...state] as T);
  }

  splice(start: number, deleteCount: number, ...items: T[number][]): void {
    this.set((state) => {
      const newValue = [...state] as T;
      newValue.splice(start, deleteCount, ...items);
      return newValue;
    });
  }

  sort(compareFn?: (a: T[number], b: T[number]) => number): void {
    this.set((state) => [...state].sort(compareFn) as T);
  }

  reverse(): void {
    this.set((state) => [...state].reverse() as T);
  }

  fill(value: T[number], start?: number, end?: number): void {
    this.set((state) => [...state].fill(value, start, end) as T);
  }

  copyWithin(target: number, start: number, end?: number): void {
    this.set((state) => [...state].copyWithin(target, start, end) as T);
  }

  *[Symbol.iterator]() {
    for (const item of this.get()) {
      yield item;
    }
  }
}

export function createVectorSlice<T extends unknown[]>(
  value: T,
  options: CreateSliceOptions
): VectorSlice<T> {
  return new VectorSlice(value, options);
}
