import { expect, test } from "vitest";
import { Transactor, TransactorCompatibleSlice } from "@cinq/transactor/index";
import { createSlice } from "@cinq/slice/slice";

test("base int transactor", () => {
  const slice = createSlice(10, { key: "simple" });
  const transactor = new Transactor<number>({
    key: "simple",
  });

  expect(() => transactor.init()).toThrowError("Transactor.init() requires a slice to be set");

  transactor.slice = slice;

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
