export function deleteItemByIndex<T>(array: T[], index: number) {
  array.splice(index, 1);
}

export function deleteItemsByIndex<T>(array: T[], indexs: number[]) {
  indexs.forEach((index) => array.splice(index, 1));
}

export function deleteItem<T>(array: T[], item: T): boolean {
  const i = array.indexOf(item);
  if (i >= 0) {
    deleteItemByIndex(array, i);
    return true;
  } else {
    return false;
  }
}

export function deleteItems<T>(array: T[], items: T[]) {
  items.forEach((item) => deleteItem(array, item));
}

export function deleteItemByField<T, Z>(array: T[], item: T, field: (v: T) => Z): boolean {
  const i = array.findIndex((old) => field(old) == field(item));
  if (i >= 0) {
    deleteItemByIndex(array, i);
    return true;
  } else {
    return false;
  }
}

export function deleteItemsByField<T, Z>(array: T[], items: T[], field: (v: T) => Z) {
  items.forEach((item) => deleteItemByField(array, item, field));
}

export function deleteItemById<T extends { id: unknown }>(array: T[], item: { id: unknown }): boolean {
  return deleteItemByField(array, item, (i) => i.id);
}

export function deleteItemsById<T extends { id: unknown }>(array: T[], items: { id: unknown }[]) {
  items.forEach((item) => deleteItemById(array, item));
}

export function findById<T extends { id: unknown }>(array: T[], item: { id: unknown }): T | undefined {
  return array.find(i => i.id == item.id);
}

export function findIndexById<T extends { id: unknown }>(array: T[], item: { id: unknown }): number {
  return array.findIndex(i => i.id == item.id);
}
