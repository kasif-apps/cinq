import {
  Transactor,
  TransactorOptions,
} from "@cinq/transactor/transactor";
import { createRecordSlice } from "@cinq/dmi/record";

export interface NetworkTransactorOptions<T, K, L>
  extends TransactorOptions<T, K, L> {}

export interface QueryOptions<T> {
  info: string;
  onSuccess: (response: Response) => Promise<T>;
  onError: (error: unknown) => void;
}

export interface QueryState<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  isError: boolean;
  isDone: boolean;
}

export class NetworkTransactor<T> extends Transactor<T> {
  state = createRecordSlice<QueryState<T>>(
    {
      data: undefined,
      error: undefined,
      isLoading: false,
      isError: false,
      isDone: false,
    },
    { key: `${this.key}-query-state` }
  );

  records: Map<string, () => Promise<void>> = new Map();

  constructor(options: NetworkTransactorOptions<T, any, any>) {
    super(options);
  }

  async query(factory: () => Promise<Response>, options: QueryOptions<T>) {
    this.records.set(options.info, async () => {
      const registry = await window.caches.open(this.key);
      const match = await registry.match(options.info);
      this.state.set({
        data: undefined,
        error: undefined,
        isLoading: true,
        isError: false,
        isDone: false,
      });

      if (match) {
        options.onSuccess(match).then((data) => {
          this.state.upsert({
            data,
            isLoading: false,
            isDone: true,
            isError: false,
          });
          this.slice.set(data);
        });
        return;
      }

      const request = factory();

      const promise = request.then((response) => {
        return new Promise<Response>(async (resolve, reject) => {
          try {
            const clone = response.clone();
            registry.put(response.url, clone);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      });

      promise
        .then((response) => {
          options.onSuccess(response).then((data) => {
            this.state.upsert({
              data,
              isLoading: false,
              isDone: true,
              isError: false,
            });
            this.slice.set(data);
          });
        })
        .catch((error) => {
          this.state.upsert({
            error,
            isLoading: false,
            isDone: true,
            isError: true,
          });
          options.onError(error);
        });
    });

    await this.records.get(options.info)?.call(this);
  }

  async invalidate(info: string) {
    const registry = await window.caches.open(this.key);
    await registry.delete(info);
    const query = this.records.get(info);

    if (query) {
      await query.call(this);
    }
  }

  async invalidateAll() {
    Promise.all(
      Array.from(this.records).map(async (entry) => {
        const info = entry[0];

        const registry = await window.caches.open(this.key);
        await registry.delete(info);
        const query = this.records.get(info);

        if (query) {
          await query.call(this);
        }
      })
    );
  }
}
