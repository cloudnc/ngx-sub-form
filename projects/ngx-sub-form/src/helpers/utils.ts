// nothing in that file should be referenced into the `public_api.ts` file!
// those are internal helpers only

export const keyValuePairToObj = <T extends { [key: string]: any }>(x: { key: any; value: any }[]): T =>
  x.reduce(
    (acc, { key, value }) => {
      acc[key] = value;

      return acc;
    },
    {} as T,
  );
