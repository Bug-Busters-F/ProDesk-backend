export function normalizeIntent(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\|\s*/g, '_')
    .replace(/\s+/g, '_');
}