import { expect, test } from "vitest";
import { Transactor } from "@cinq/transactor/base/transactor";
import { createSlice } from "@cinq/slice/slice";

test("base transactor with default codec", () => {
  const slice = createSlice(10, { key: "simple" });
  const transactor = new Transactor<number>({
    key: "simple",
    slice,
  });

  expect(transactor.defaultEncoder()).toBe(JSON.stringify({ value: 10 }));
  expect(transactor.defaultDecoder(JSON.stringify({ value: 20 }))).toBe(20);
});

test("base int transactor", () => {
  const slice = createSlice(10, { key: "simple" });
  const transactor = new Transactor<number>({
    key: "simple",
  });

  expect(() => transactor.init()).toThrowError(
    "Transactor.init() requires a slice to be set"
  );

  transactor.slice = slice;

  expect(transactor.buildKey()).toBe("simple.simple");
  expect(transactor).toBeInstanceOf(Transactor);

  expect(transactor.encode()).toBe(JSON.stringify({ value: 10 }));
  expect(transactor.decode(JSON.stringify({ value: 20 }))).toBeUndefined();

  expect(slice.get()).toBe(20);

  transactor.setModel(Transactor.IntRadix16);

  slice.set(9);
  expect(transactor.encode()).toBe("9");

  slice.set(12);
  expect(transactor.encode()).toBe("c");

  slice.set(-10);
  expect(transactor.encode()).toBe("-a");

  transactor.setModel(Transactor.IntRadix2);

  slice.set(3);
  expect(transactor.encode()).toBe("11");

  slice.set(15);
  expect(transactor.encode()).toBe("1111");

  slice.set(-54);
  expect(transactor.encode()).toBe("-110110");
});

test("base bool transactor", () => {
  const slice = createSlice(false, { key: "simple" });
  const transactor = new Transactor({
    key: "simple",
    slice,
  });

  expect(transactor.encode()).toBe(JSON.stringify({ value: false }));
  expect(transactor.decode(JSON.stringify({ value: true }))).toBeUndefined();

  expect(slice.get()).toBe(true);

  transactor.setModel(Transactor.Boolean);

  slice.set(false);
  expect(transactor.encode()).toBe("false");

  slice.set(true);
  expect(transactor.encode()).toBe("true");
});

test("base date transactor", () => {
  const slice = createSlice(new Date(), { key: "simple" });
  const transactor = new Transactor({
    key: "simple",
    slice,
  });

  transactor.setModel(Transactor.Date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tomowrow = new Date();
  tomowrow.setDate(tomowrow.getDate() + 1);

  slice.set(yesterday);
  expect(transactor.encode()).toBe(yesterday.toISOString());

  slice.set(tomowrow);
  expect(transactor.encode()).toBe(tomowrow.toISOString());
});

test("base string transactor with default model", () => {
  const slice = createSlice("Hello, World!", { key: "simple" });
  const transactor = new Transactor({
    key: "simple",
    model: Transactor.String,
    slice,
  });

  slice.set("hi");
  expect(transactor.encode()).toBe("hi");

  slice.set("bye");
  expect(transactor.encode()).toBe("bye");
});

test("data type models", () => {
  const stringSlice = createSlice("Hello, World!", { key: "string-slice" });
  expect(Transactor.String.encode(stringSlice)).toBe("Hello, World!");
  expect(Transactor.String.decode("Hi")).toBe("Hi");

  const intSlice = createSlice(100, { key: "int-slice" });
  expect(Transactor.Int.encode(intSlice)).toBe("100");
  expect(Transactor.Int.decode("50")).toBe(50);

  const radix2Slice = createSlice(3, { key: "radix2-slice" });
  expect(Transactor.IntRadix2.encode(radix2Slice)).toBe("11");
  expect(Transactor.IntRadix2.decode("100101")).toBe(37);

  const radix16Slice = createSlice(12, { key: "radix16-slice" });
  expect(Transactor.IntRadix16.encode(radix16Slice)).toBe("c");
  expect(Transactor.IntRadix16.decode("f")).toBe(15);

  const booleanSlice = createSlice(false, { key: "boolean-slice" });
  expect(Transactor.Boolean.encode(booleanSlice)).toBe("false");
  expect(Transactor.Boolean.decode("true")).toBe(true);

  const dateSlice = createSlice(new Date(), { key: "date-slice" });
  expect(Transactor.Date.encode(dateSlice)).toBe(new Date().toISOString());
  expect(Transactor.Date.decode("2021-05-31T21:00:00.000Z")).toStrictEqual(
    new Date("2021-05-31T21:00:00.000Z")
  );
});
