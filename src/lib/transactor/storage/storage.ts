import { Transactor, TransactorOptions } from "@cinq/transactor/base/transactor";

export type StorageType = "localStorage" | "sessionStorage";

export interface StorageTransactorOptions<T, K, L>
  extends TransactorOptions<T, K, L> {
  type?: StorageType;
}

export class StorageTransactor<T> extends Transactor<T> {
  type: StorageType;

  constructor(options: StorageTransactorOptions<T, any, any>) {
    super(options);
    this.type = options.type || "localStorage";
  }

  init() {
    super.init();
    const record = window[this.type].getItem(this.buildKey());

    if (record) {
      this.decode(record);
    } else {
      this.set();
    }

    window.addEventListener("storage", (event) => {
      if (event.key === this.buildKey()) {
        this.decode(event.newValue);
      }
    });

    this.slice.subscribe(() => {
      this.set();
    });
  }

  set() {
    window[this.type].setItem(this.buildKey(), this.encode());
  }

  kill() {
    window[this.type].removeItem(this.buildKey());
  }
}
