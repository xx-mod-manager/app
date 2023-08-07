export function notNull<T>(value: T | undefined | null, field?: string): T {
  if (value == undefined) throw Error(`${field ?? 'Value'} is null`);
  return value;
}
