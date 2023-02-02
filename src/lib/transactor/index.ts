import { Slice } from "@cinq/slice/slice";
export { StorageTransactor } from "@cinq/transactor/storage/storage";

export type TransactorCompatibleSlice<T> = Slice<T>;

export type DataTypeModel<T, K, L = K> = {
  encode: (slice: TransactorCompatibleSlice<T>) => K;
  decode: (record: L, slice: TransactorCompatibleSlice<T>) => T;
};

export interface TransactorOptions<T, K, L> {
  key: string;
  slice?: TransactorCompatibleSlice<T>;
  model?: DataTypeModel<T, K, L>;
}

export class Transactor<T> {
  encoder: DataTypeModel<T, any>["encode"] = this.defaultEncoder;
  decoder: DataTypeModel<T, any>["decode"] = this.defaultDecoder;
  slice: TransactorCompatibleSlice<T>;
  key: string;

  constructor(options: TransactorOptions<T, any, any>) {
    this.key = options.key;

    this.slice = options.slice!;

    if (options.model) {
      this.setModel(options.model);
    }
  }

  defaultEncoder<K>(): K {
    return JSON.stringify({ value: this.slice.get() }) as K;
  }

  defaultDecoder<K>(record: K): T {
    return JSON.parse(record as string).value;
  }

  setModel<K, L>(model: DataTypeModel<T, K, L>) {
    this.encoder = model.encode;
    this.decoder = model.decode;
  }

  encode(): ReturnType<DataTypeModel<T, any>["encode"]> {
    return this.encoder(this.slice);
  }

  decode<K>(record: K): void {
    const value = this.decoder(record, this.slice);
    this.slice.set(value);
  }

  init() {
    if (!this.slice) {
      throw new Error("Transactor.init() requires a slice to be set");
    }
  }

  static String: DataTypeModel<string, string> = {
    encode: (slice) => slice.get(),
    decode: (record, _slice) => record,
  };

  static Int: DataTypeModel<number, string> = {
    encode: (slice) => slice.get().toString(10),
    decode: (record, _slice) => parseInt(record, 10),
  };

  static IntRadix2: DataTypeModel<number, string> = {
    encode: (slice) => slice.get().toString(2),
    decode: (record, _slice) => parseInt(record, 2),
  };

  static IntRadix16: DataTypeModel<number, string> = {
    encode: (slice) => slice.get().toString(16),
    decode: (record, _slice) => parseInt(record, 16),
  };

  static Boolean: DataTypeModel<boolean, string> = {
    encode: (slice) => slice.get().toString(),
    decode: (record, _slice) => record === "true",
  };

  static Date: DataTypeModel<Date, string> = {
    encode: (slice) => slice.get().toISOString(),
    decode: (record, _slice) => new Date(record),
  };
}
