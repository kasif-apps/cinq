<center>
  <img width="80" src="assets/cinq.png" />
</center>

# Cinq

## Introduction

Cinq is a global state synchronization and management tool that also provides some simple data manipulation interfaces.

## Getting Started

### Install

Using npm

```bash
npm i @kasif-apps/cinq
```

Using yarn

```bash
yarn add @kasif-apps/cinq
```

Using pnpm

```bash
pnpm i @kasif-apps/cinq
```

### Basic Usage

#### Simple Slices

Cinq has the simple concept of easy to track slices. These slices are always observed and no undocumented change pass by without cinq knowing about it. To start, you need to create a slice with a value of your choosing and a key to identify the slice using the `createSlice` function.

```typescript
import { createSlice } from "@kasif-apps/cinq";

const countSlice = createSlice(0, { key: "count" });
```

After this point, you can get the current value with the `.get()` method, set its value with the `.set()` method or subscribe to its changes.

```typescript
countSlice.subscribe((e: CustomEvent<SliceUpdate>) => {
  console.log(e.detail.value); // logs the updated value
  console.log(e.detail.oldValue); // logs the old value
  console.log(e.detail.type); // logs the update type
});

countSlice.get(); // 0

countSlice.set(1);

countSlice.get(); // 1
```

The callback function you provide to the `.subscribe()` method will recieve a custom event of `SliceUpdate` in which you will find some details about the update along with the new value.

> Try not to set any value on a subscription callback to avoid infinite loops. Only do so if you know what you are doing.

You can set a slice based on its previous value with a callback function, or update it with a `Promise` that resolves to the same value type.

```typescript
countSlice.set((oldCount) => oldCount + 5);
countSlice.set(Promise.resolve(10));
```

If you want to extract the type of a slice, you can use the `TypeofSlice` helper.

```typescript
import { TypeofSlice } from "@kasif-apps/cinq";

let count: TypeofSlice<typeof countSlice>;
//  ^ -> number
```

#### Derivative Slices

Derivative slices are slices that depend on another slice to calculate their value and are **readonly**. You can derive a slice by using its `.derive()` method and passing a value getter function and the usual configuration.

```typescript
const minutesSlice = createSlice(20, { key: "minutes" });
const labelSlice = minutesSlice.derive((minutes) => `${minutes} mins`, {
  key: "minutes-label",
});

labelSlice.get(); // 20 mins
minutesSlice.set(50);
labelSlice.get(); // 50 mins
```

You can subscribe to a dervied slice's updates, everything will work the same but you cannot set it, the program will throw an error.

A derived slice will have its `parent` property set to the slice it is deriving.

```typescript
minutesSlice.parent; // points to labelSlice
```

> You can also create your own readonly slice with `ReadOnlySlice` class but you will need to handle the aphorementioned `parent` logic by yourself if you need it.

> A basic slice will have its `parent` property set to null.

#### Bound Slices

Bound slices are slices that update alongside another slice. The new incoming value will be the same as the old one but you can track the updates with a subscriber. You can create a bound slice just like a derived slice but its own value.

```typescript
const countSlice = createSlice(0, { key: "count" });
const countWatcher = countSlice.bind("I am updated when count is updated", {
  key: "count-watcher",
});

countWatcher.subscribe((e) => {
  console.log(e.detail.value); // "I am updated when count is updated"
});

countSlice.set(1);
```

> Bound slices are **not** readonly, you can set them as you will.

### Data Manipulation Interfaces (DMI)

There are 2 (for now) basic data type wrappers to make data manipulation easier. These wrappers provide you the basic mutation methods for your data type.

#### Record DMI

You can use this dmi with object data to set a specific key to a value or upsert arbitrary data to the slice. You can also iterate over your slice to get key value pairs as an array.

```typescript
import { createRecordSlice } from "@kasif-apps/cinq";

const dataSlice = createRecordSlice(
  { some: "random", data: 10, isGood: false },
  { key: "data" }
);

dataSlice.setKey("some", "arbitrary"); // methods are fully type safe
dataSlice.get(); // { some: "arbitrary", data: 10, isGood: false }

dataSlice.upsert({ data: 200, isGood: true });
dataSlice.get(); // { some: "arbitrary", data: 200, isGood: true }

console.log([...dataSlice]); // [ ["some", "arbitrary"], ["data", 200], ["isGood", true] ]
```

#### Vector DMI

You can use this dmi to manipulate your list data. It encompasses all the mutating methods of the `Array` object while providing an iterator symbol to effectively use the spread operator.

```typescript
import { createVectorSlice } from "@kasif-apps/cinq";

const dataSlice = createVectorSlice([0, 1, 2], { key: "data" });

dataSlice.reverse();
dataSlice.get(); // [2, 1, 0]

dataSlice.pop();
dataSlice.get(); // [2, 1]

dataSlice.push(10);
dataSlice.get(); // [2, 1, 10]

dataSlice.setAt(1, 57);
dataSlice.get(); // [2, 57, 0]

console.log([...dataSlice]); // [2, 57, 0]
```

### Simple Usage With React

You can create a simple hook to use cinq with react.

```typescript
import * as React from "react";
import { Slice, SliceUpdate } from "@kasif-apps/cinq";

export function useSlice<T>(slice: Slice<T>): [T, Slice<T>["set"]] {
  const [value, setValue] = React.useState(slice.get());

  const listener = (event: CustomEvent<SliceUpdate<T>>) => {
    setValue(event.detail.value);
  };

  React.useEffect(() => slice.subscribe(listener), []);

  return value;
}
```

You don't need to set a global provider or a root level element. Just create your slices as you do, and use the hook to consume the value reactively.

> Notice that the `useEffect` returns the result of the `.subscribe()` method. It returns an `unsubscribe()` function that cleans up the event listener.
