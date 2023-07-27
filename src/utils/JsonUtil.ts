export function replacer(key: string, value: unknown) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: [...value],
    };
  } else {
    return value;
  }
}

export function reviver(key: string, value: unknown) {
  if (typeof value === 'object' && value !== null) {
    if ('dataType' in value && 'value' in value) {
      if (value.dataType === 'Map') {
        return new Map(value.value as [unknown, unknown][]);
      }
    }
  }
  return value;
}
