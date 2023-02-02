import { expect, test } from "vitest";
import { createSlice, Slice, SliceUpdate, ReadonlySlice } from "./slice";

test("simple slice", () => {
  const slice = createSlice(10, { key: "simple" });

  expect(slice).toBeInstanceOf(Slice);
  expect(slice.parent).toBeNull();

  const unsubscribe = slice.subscribe((e: CustomEvent<SliceUpdate<number>>) => {
    expect(e.detail.type).toBe("set");
    expect(e.detail.value).toBeInstanceOf(Number);
    expect(e.detail.value).toBe(20);
    expect(e.detail.oldValue).toBeInstanceOf(Number);
    expect(e.detail.oldValue).toBe(10);
  });

  expect(slice.get()).toBe(10);
  slice.set(20)?.then((e) => {
    expect(e.detail).toBeInstanceOf(Object);
    expect(e.detail.type).toBe("set");
    expect(e.detail.value).toBe(20);
    expect(e.detail.oldValue).toBe(10);
  });
  expect(slice.get()).toBe(20);

  expect(unsubscribe).toBeInstanceOf(Function);
  // @ts-expect-error
  expect(slice.value).toBeUndefined();

  expect(unsubscribe()).toBeUndefined();
});

test("promise slice", () => {
  const slice = createSlice(10, { key: "simple" });

  expect(slice).toBeInstanceOf(Slice);
  expect(slice.parent).toBeNull();

  slice.set(new Promise((resolve) => resolve(undefined)));
  expect(slice.get()).toBe(10);

  const promise = Promise.resolve(20);

  const value = slice.get();
  expect(value).toBe(10);
  slice.set(promise)?.then((e) => {
    expect(e.detail.oldValue).toBe(10);
    expect(e.detail.value).toBe(20);
  });

  slice.subscribe((e: CustomEvent<SliceUpdate<number>>) => {
    expect(e.detail.type).toBe("set");
    expect(e.detail.value).toBeInstanceOf(Number);
    expect(e.detail.value).toBe(20);
    expect(e.detail.oldValue).toBeInstanceOf(Number);
    expect(e.detail.oldValue).toBe(10);
  });
});

test("readonly slice", () => {
  const readonlySlice = new ReadonlySlice("Hello World", { key: "readonly" });

  expect(readonlySlice).toBeInstanceOf(ReadonlySlice);

  const unsubscribe = readonlySlice.subscribe(() => {});
  expect(unsubscribe).toBeInstanceOf(Function);

  expect(readonlySlice.get()).toBe("Hello World");
  expect(() => readonlySlice.set("Some other value")).toThrowError(
    "Readonly slice cannot be modified"
  );
  expect(readonlySlice.get()).toBe("Hello World");
});

test("derivative slice", () => {
  const slice = createSlice(10, { key: "simple" });
  const derivativeSlice = slice.derive((value) => (value * 2).toString(), {
    key: "derived",
  });

  expect(derivativeSlice).toBeInstanceOf(Slice);
  expect(derivativeSlice).toBeInstanceOf(ReadonlySlice);

  expect(slice.parent).toBeNull();
  expect(derivativeSlice.parent).toBe(slice);

  expect(() => derivativeSlice.set("15")).toThrowError(
    "Readonly slice cannot be modified"
  );
  expect(slice.get()).toBe(10);
  expect(derivativeSlice.get()).toBe("20");
  slice.set(15);
  expect(slice.get()).toBe(15);
  expect(derivativeSlice.get()).toBe("30");
});

test("bound slice", () => {
  const slice = createSlice({ x: 10, y: 20 }, { key: "simple" });
  const boundSlice = slice.bind("some data", { key: "bound" });

  expect(boundSlice).toBeInstanceOf(Slice);

  expect(slice.parent).toBeNull();
  expect(boundSlice.parent).toBe(slice);

  expect(boundSlice.get()).toBe("some data");
  expect(slice.get()).toEqual({ x: 10, y: 20 });

  boundSlice.set("some other data");
  expect(boundSlice.get()).toBe("some other data");

  boundSlice.subscribe((e: CustomEvent<SliceUpdate<string>>) => {
    expect(e.detail.type).toBe("set");
    expect(e.detail.value).toBe("some other data");
    expect(e.detail.oldValue).toBe("some other data");
  });

  slice.set({ x: 15, y: 25 });
  expect(boundSlice.get()).toBe("some other data");
});
