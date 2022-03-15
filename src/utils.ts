export function avg(list: Uint8Array) {
  return list.reduce((prev, curr) => prev + curr) / list.length;
}
