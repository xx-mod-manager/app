export class ImpAsset {
  readonly id: string;
  readonly path: string;
  readonly type: 'dir' | 'zip';

  constructor({ id, path, type }: { id: string; path: string; type: 'dir' | 'zip' }) {
    this.id = id;
    this.path = path;
    this.type = type;
  }
}

export class ImpResource {
  readonly id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  readonly assets: Map<string, ImpAsset> = new Map;

  constructor({ id, name, description, author, category }: { id: string; name: string; description: string; author: string; category: string; }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.author = author;
    this.category = category;
  }

  static newById(id: string): ImpResource {
    return new ImpResource({
      id: id,
      name: id,
      description: id,
      author: 'none',
      category: 'other',
    });
  }

  update({ name, description, author, category }: { name?: string; description?: string; author?: string; category?: string; }) {
    if (name != null) this.name = name;
    if (description != null) this.description = description;
    if (author != null) this.author = author;
    if (category != null) this.category = category;
  }

  hasAsset(id: string): boolean {
    return this.assets.has(id);
  }

  addAsset(asset: ImpAsset) {
    this.assets.set(asset.id, asset);
  }

  deleteAsset(assetId: string) {
    this.assets.delete(assetId);
  }

  addAssets(assets: IterableIterator<ImpAsset>) {
    for (const asset of assets) {
      this.addAsset(asset);
    }
  }
}
