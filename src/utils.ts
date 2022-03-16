export function avg(list: Uint8Array) {
  return list.reduce((prev, curr) => prev + curr) / list.length;
}

export function chunk(arr: [] | Uint8Array, len: number) {
  const chunks = [];
  const n = arr.length;
  let i = 0;
  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}
