import { Asset } from 'src/class/Asset';
import { Game } from 'src/class/Game';
import { GameConfig } from 'src/class/GameConfig';
import { Resource } from 'src/class/Resource';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonClassMap = new Map<string, (value: any) => object>([
  ['GameConfig', (value) => new GameConfig(value)],
  ['Game', (value) => new Game(value)],
  ['Resource', (value) => new Resource(value)],
  ['Asset', (value) => new Asset(value)],
]);

export function replacer(_: string, value: unknown) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: [...value],
    };
  } else if (typeof value === 'object' && value != null) {
    const constructorName = value.constructor.name;
    if (jsonClassMap.has(constructorName)) {
      return {
        dataType: constructorName,
        value: { ...value },
      };
    }
  }
  return value;
}

export function reviver(_: string, value: unknown) {
  if (typeof value === 'object' && value != null) {
    if ('dataType' in value && 'value' in value && typeof value.dataType === 'string') {
      if (value.dataType === 'Map') {
        return new Map(value.value as [unknown, unknown][]);
      } else {
        const constructor = jsonClassMap.get(value.dataType);
        if (constructor != null) {
          return constructor(value.value);
        }
      }
    }
  }
  return value;
}
