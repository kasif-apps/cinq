import { expect, test } from "vitest";
import { createSlice } from "@cinq/slice/slice";
import { StorageTransactor } from "@cinq/transactor/storage/storage";

test("local storage transactor", () => {
  const slice = createSlice(10, { key: "count" });
  const transactor = new StorageTransactor({
    key: "storage",
    slice,
  });

  transactor.init();

  expect(localStorage.getItem("storage.count")).toBe(
    JSON.stringify({ value: 10 })
  );

  slice.set(20);
  expect(localStorage.getItem("storage.count")).toBe(
    JSON.stringify({ value: 20 })
  );

  // this fails because of jsdom
  // localStorage.setItem("storage.count", JSON.stringify({ value: 30 }));
  // expect(slice.get()).toBe(30);

  transactor.kill();

  expect(localStorage.getItem("storage.count")).toBeNull();
});


test("local storage transactor with default value", () => {
  const slice = createSlice(10, { key: "count" });
  const transactor = new StorageTransactor({
    key: "storage",
    slice,
  });

  localStorage.setItem("storage.count", JSON.stringify({ value: 30 }));

  transactor.init();

  expect(slice.get()).toBe(30);
});
