import { expect, test } from "vitest";
import { Slice } from "../slice/slice";
import { createRecordSlice, RecordSlice } from "./record";
import { createVectorSlice, VectorSlice } from "./vector";

test("record slice", () => {
  const recordSlice = createRecordSlice(
    {
      name: "John",
      age: 20,
    },
    { key: "record" }
  );

  expect(recordSlice).toBeInstanceOf(Slice);
  expect(recordSlice).toBeInstanceOf(RecordSlice);

  let value = recordSlice.get();
  expect(value).toHaveProperty("name");
  expect(value).toHaveProperty("age");
  expect(value.name).toBe("John");
  expect(value.age).toBe(20);

  recordSlice.set({ age: 30, name: "Jane" });
  value = recordSlice.get();

  expect(value.name).toBe("Jane");
  expect(value.age).toBe(30);

  recordSlice.setKey("name", "Alice");
  recordSlice.upsert({ age: 40 });
  value = recordSlice.get();

  expect(value.name).toBe("Alice");
  expect(value.age).toBe(40);

  expect([...recordSlice]).toEqual([
    ["age", 40],
    ["name", "Alice"],
  ]);

  recordSlice.setKey("name", () => "Bob");
  value = recordSlice.get();

  expect(value.name).toBe("Bob");

  recordSlice.upsert((oldValue) => ({ age: (oldValue.age || 0) + 1 }));
  value = recordSlice.get();

  expect(value.age).toBe(41);
});

test("vector slice", () => {
  const vectorSlice = createVectorSlice([1, 2, 3], { key: "vector" });

  expect(vectorSlice).toBeInstanceOf(Slice);
  expect(vectorSlice).toBeInstanceOf(VectorSlice);

  let value = vectorSlice.get();
  expect(value).toEqual([1, 2, 3]);

  vectorSlice.set([4, 5, 6]);
  value = vectorSlice.get();
  expect(value).toEqual([4, 5, 6]);

  vectorSlice.push(7);
  value = vectorSlice.get();
  expect(value).toEqual([4, 5, 6, 7]);

  vectorSlice.pop();
  vectorSlice.pop();
  value = vectorSlice.get();
  expect(value).toEqual([4, 5]);

  vectorSlice.unshift(3);
  value = vectorSlice.get();
  expect(value).toEqual([3, 4, 5]);

  vectorSlice.shift();
  vectorSlice.shift();
  value = vectorSlice.get();
  expect(value).toEqual([5]);

  vectorSlice.splice(0, 1, 1, 2, 3);
  value = vectorSlice.get();
  expect(value).toEqual([1, 2, 3]);

  vectorSlice.splice(0, 3, 4, 5, 6);
  value = vectorSlice.get();
  expect(value).toEqual([4, 5, 6]);

  vectorSlice.reverse();
  value = vectorSlice.get();
  expect(value).toEqual([6, 5, 4]);

  vectorSlice.sort((a, b) => a - b);
  value = vectorSlice.get();
  expect(value).toEqual([4, 5, 6]);

  vectorSlice.fill(0);
  value = vectorSlice.get();
  expect(value).toEqual([0, 0, 0]);

  vectorSlice.copyWithin(0, 1);
  value = vectorSlice.get();
  expect(value).toEqual([0, 0, 0]);

  vectorSlice.copyWithin(0, 1, 2);
  value = vectorSlice.get();
  expect(value).toEqual([0, 0, 0]);

  vectorSlice.setAt(0, 1);
  value = vectorSlice.get();
  expect(value).toEqual([1, 0, 0]);

  vectorSlice.setAt(1, 2);
  value = vectorSlice.get();
  expect(value).toEqual([1, 2, 0]);

  expect([...vectorSlice]).toEqual([1, 2, 0]);
});
