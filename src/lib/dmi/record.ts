import { CreateSliceOptions, SliceSetter, Slice } from "@cinq/slice/slice";

export class Record<T extends object> {
  constructor(
    public set: (value: SliceSetter<T>) => void,
    public get: () => T
  ) {}

  upsert(value: SliceSetter<Partial<T>>): void {
    const newValue: Partial<T> =
      typeof value === "function" ? (value as Function)(this.get()) : value;
    this.set((state) => ({ ...state, ...newValue }));
  }

  setKey<K extends keyof T>(key: K, value: SliceSetter<T[K]>): void {
    const newValue: T[K] =
      typeof value === "function"
        ? (value as Function)(this.get()[key])
        : value;

    this.set((state) => ({ ...state, [key]: newValue }));
  }

  *[Symbol.iterator]() {
    for (const entry of Object.entries(this.get())) {
      yield entry;
    }
  }
}

export class RecordSlice<T extends object> extends Slice<T> {
  record: Record<T> = new Record(
    () => {},
    () => undefined as unknown as T
  );

  constructor(value: T, options: CreateSliceOptions) {
    super(value, options);
    this.record = new Record(this.set, this.get);
  }

  upsert = this.record.upsert;
  setKey = this.record.setKey;

  *[Symbol.iterator]() {
    for (const entry of Object.entries(this.get())) {
      yield entry;
    }
  }
}

export function createRecordSlice<T extends object>(
  value: T,
  options: CreateSliceOptions
): RecordSlice<T> {
  return new RecordSlice(value, options);
}
