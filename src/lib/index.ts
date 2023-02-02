export { Slice, createSlice, ReadonlySlice } from "./slice/slice";
export { Transactor } from "./transactor/index";
export { StorageTransactor } from "./transactor/storage/storage";
export { createRecordSlice, RecordSlice } from "./dmi/record";
export { createVectorSlice, VectorSlice } from "./dmi/vector";

export type {
  CreateSliceOptions,
  TypeofSlice,
  SliceSetter,
  SliceUpdate,
} from "./slice/slice";
