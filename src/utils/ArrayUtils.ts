export function deleteArrayItemByIndex<T>(array: T[], index: number) {
  array.splice(index, 1);
}

export function deleteArrayItemsByIndex<T>(array: T[], indexs: number[]) {
  indexs.forEach((index) => array.splice(index, 1));
}

export function deleteArrayItem<T>(array: T[], item: T): boolean {
  const i = array.indexOf(item);
  if (i >= 0) {
    deleteArrayItemByIndex(array, i);
    return true;
  } else {
    return false;
  }
}

export function deleteArrayItems<T>(array: T[], items: T[]) {
  items.forEach((item) => deleteArrayItem(array, item));
}

export function deleteArrayItemByField<T, Z>(array: T[], item: T, field: (v: T) => Z): boolean {
  const i = array.findIndex((old) => field(old) == field(item));
  if (i >= 0) {
    deleteArrayItemByIndex(array, i);
    return true;
  } else {
    return false;
  }
}

export function deleteArrayItemsByField<T, Z>(array: T[], items: T[], field: (v: T) => Z) {
  items.forEach((item) => deleteArrayItemByField(array, item, field));
}

export function deleteArrayItemByFieldId<T extends { id: unknown }>(array: T[], item: { id: unknown }): boolean {
  return deleteArrayItemByField(array, item, (i) => i.id);
}

export function deleteArrayItemsByFileId<T extends { id: unknown }>(array: T[], items: { id: unknown }[]) {
  items.forEach((item) => deleteArrayItemByFieldId(array, item));
}

export function deleteArrayItemById<T extends { id: Z }, Z>(array: T[], id: Z): boolean {
  const i = findArrayIndexById(array, id);
  if (i >= 0) {
    deleteArrayItemByIndex(array, i);
    return true;
  } else {
    return false;
  }
}

export function findArrayItemByFieldId<T extends { id: unknown }>(array: T[], item: { id: unknown }): T | undefined {
  return array.find(i => i.id == item.id);
}

export function findArrayItemById<T extends { id: Z }, Z>(array: T[], id: Z): T | undefined {
  return array.find(i => i.id == id);
}

export function findArrayIndexByFieldId<T extends { id: unknown }>(array: T[], item: { id: unknown }): number {
  return array.findIndex(i => i.id == item.id);
}

export function findArrayIndexById<T extends { id: Z }, Z>(array: T[], id: Z): number {
  return array.findIndex(i => i.id == id);
}
