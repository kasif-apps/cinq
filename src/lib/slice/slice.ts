export interface SliceUpdate<T> {
  type: string;
  value: T;
  oldValue: T;
}

export type SliceSetter<T> = ((oldValue: T) => T) | T | Promise<void | T>;

export interface CreateSliceOptions {
  key: string;
}

export type TypeofSlice<T extends Slice<any>> = ReturnType<T["get"]>;

export class Slice<T> extends EventTarget {
  #value: T;
  parent: Slice<any> | null = null;
  key: string;

  constructor(value: T, public options: CreateSliceOptions) {
    super();
    this.#value = value;
    this.key = options.key;
  }

  public subscribe(callback: (e: CustomEvent<SliceUpdate<T>>) => void) {
    const handler = (e: CustomEvent<SliceUpdate<T>>) => callback(e);
    this.addEventListener("update", handler as EventListener);
    return () => this.removeEventListener("update", handler as EventListener);
  }

  public get() {
    return this.#value;
  }

  public set(value: SliceSetter<T>) {
    return this.assign(value);
  }

  public derive<K>(valueGetter: (value: T) => K, options: CreateSliceOptions) {
    const slice = new ReadonlySlice(valueGetter(this.#value), options);
    slice.parent = this;
    this.subscribe((e) => {
      slice.assign(valueGetter(e.detail.value));
    });
    return slice;
  }

  public bind<K>(value: K, options: CreateSliceOptions) {
    const slice = new Slice(value, options);
    slice.parent = this;
    this.subscribe((e) => {
      slice.assign(slice.get());
    });
    return slice;
  }

  private assign(
    value: SliceSetter<T>
  ): Promise<CustomEvent<SliceUpdate<T>>> | void {
    let newValue: T;

    if (typeof value === "function") {
      newValue = (value as (oldValue: T) => T)(this.#value);
    } else if (value instanceof Promise) {
      return new Promise<CustomEvent<SliceUpdate<T>>>(async (resolve) => {
        const newValue = await value;
        if (newValue === undefined) return;
        const result = this.#commit(newValue);
        resolve(result);
      });
    } else {
      newValue = value;
    }

    return new Promise<CustomEvent<SliceUpdate<T>>>((resolve) => {
      resolve(this.#commit(newValue));
    });
  }

  #commit(value: T) {
    const event = new CustomEvent("update", {
      detail: {
        type: "set",
        value: value,
        oldValue: this.#value,
      },
    });

    this.#value = value;
    this.dispatchEvent(event);
    return event;
  }
}

export function createSlice<T>(value: T, options: CreateSliceOptions) {
  return new Slice<T>(value, options);
}

export class ReadonlySlice<T> extends Slice<T> {
  public set(_value: SliceSetter<T>) {
    throw new Error("Readonly slice cannot be modified");
  }
}