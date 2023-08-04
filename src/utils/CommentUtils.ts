export function notNull<T>(value: T | undefined | null, field?: string): T {
  if (value == undefined) throw Error(field != undefined ? `${field} value is null.` : 'Not null value is null.');
  return value;
}
