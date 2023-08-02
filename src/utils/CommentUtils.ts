export function notNull<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) throw Error('Not null value is null.');
  return value;
}
