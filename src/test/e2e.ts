import { NetworkTransactor, createSlice } from "../lib";

const slice = createSlice(
  { message: "Hello, world!" },
  { key: "message-slice" }
);

const transactor = new NetworkTransactor({ slice, key: "stale-network" });

const url = "https://640dd0141a18a5db838015d1.mockapi.io/message";
const request = () => fetch(url);

console.assert(
  JSON.stringify(transactor.state.get()) ===
    JSON.stringify({
      data: undefined,
      error: undefined,
      isLoading: false,
      isError: false,
      isDone: false,
    })
);

transactor.query(request, {
  info: url,
  onSuccess: async (response: Response) => {
    const data = (await response.json()) as Array<{
      message: string;
      id: string;
    }>;
    return { message: `Hello, ${data[1].message}` };
  },
  onError: (error: unknown) => {
    console.log(error);
  },
});

slice.subscribe(() => {
  console.assert(slice.get().message === "Hello, Antwan");
});
