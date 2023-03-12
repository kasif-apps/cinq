export { Slice, createSlice, ReadonlySlice } from "./slice/slice";
export { Transactor } from "./transactor/base/transactor";
export { StorageTransactor } from "./transactor/storage/storage";
export { NetworkTransactor } from "./transactor/network/network";
export { createRecordSlice, RecordSlice } from "./dmi/record";
export { createVectorSlice, VectorSlice } from "./dmi/vector";

export type {
  CreateSliceOptions,
  TypeofSlice,
  SliceSetter,
  SliceUpdate,
} from "./slice/slice";

export type {
  TransactorOptions,
  TransactorCompatibleSlice,
} from "./transactor/base/transactor";
export type {
  StorageTransactorOptions,
  StorageType,
} from "./transactor/storage/storage";
export type { NetworkTransactorOptions } from "./transactor/network/network";
