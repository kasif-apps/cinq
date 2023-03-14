import { CreateSliceOptions, Slice, SliceSetter } from "@cinq/slice/slice";

export class Vector<T extends unknown[]> {
  constructor(
    public set: (value: SliceSetter<T>) => void,
    public get: () => T
  ) {}

  setAt(index: number, value: T[number]): void {
    this.set((state) => {
      const newValue = [...state] as T;
      newValue[index] = value;
      return newValue;
    });
  }

  push(...items: T[number][]): void {
    this.set((state) => [...state, ...items] as T);
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

export class VectorSlice<T extends unknown[]> extends Slice<T> {
  vector: Vector<T> = new Vector(
    () => {},
    () => undefined as unknown as T
  );

  constructor(value: T, options: CreateSliceOptions) {
    super(value, options);
    this.vector = new Vector(this.set, this.get);
  }

  setAt = this.vector.setAt;
  push = this.vector.push;
  pop = this.vector.pop;
  shift = this.vector.shift;
  unshift = this.vector.unshift;
  splice = this.vector.splice;
  sort = this.vector.sort;
  reverse = this.vector.reverse;
  fill = this.vector.fill;
  copyWithin = this.vector.copyWithin;

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
