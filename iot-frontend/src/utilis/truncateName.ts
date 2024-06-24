export function truncateName(name: string, length: number) {
  return name.slice(0, length);
}

export function extractFirstWord(str: string) {
  return str.trim().split(" ")[0];
}
