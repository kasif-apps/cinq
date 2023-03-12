export { Slice, createSlice, ReadonlySlice } from "./slice/slice";
export { Transactor } from "./transactor/transactor";
export { StorageTransactor } from "./transactor/storage";
export { NetworkTransactor } from "./transactor/network";
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
} from "./transactor/transactor";
export type {
  StorageTransactorOptions,
  StorageType,
} from "./transactor/storage";
export type { NetworkTransactorOptions } from "./transactor/network";
