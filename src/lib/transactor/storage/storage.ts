import { Transactor } from "@cinq/transactor/index";

export class StorageTransactor<T> extends Transactor<T> {
  init() {
    super.init();
    const record = localStorage.getItem(this.buildKey());

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
    localStorage.setItem(this.buildKey(), this.encode());
  }

  kill() {
    localStorage.removeItem(this.buildKey());
  }
}
