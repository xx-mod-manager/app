import { ApiAuthor, ApiComment, ApiDiscussion, ApiEdge, ApiReactionGroup, ApiRelease, ApiReleaseAsset, GraphArray } from './GraphqlClass';

interface ConnectionItem {
  id: string
  cursor: string
}

export class PageArray<T extends ConnectionItem> {
  totalCount = 0;
  nodes: T[] = [];

  public isFull(): boolean {
    if (this.nodes.length > this.totalCount) throw Error('PageArray nodes size greate totalCount!');
    return this.nodes.length == this.totalCount;
  }

  public deleteNode(totalCount: number, nodeId: string) {
    this.totalCount = totalCount;
    this.nodes.splice(
      this.nodes.findIndex((it) => it.id == nodeId),
      1
    );
  }

  public loadAll<V>(graphArray: GraphArray<V>, converFun: (value: ApiEdge<V>) => T) {
    this.totalCount = graphArray.totalCount;
    graphArray.edges.forEach((it) => {
      this.nodes.push(converFun(it));
    });
  }

  public updateAll<V>(graphArray: GraphArray<V>, converFun: (value: ApiEdge<V>) => T) {
    this.totalCount = graphArray.totalCount;
    this.nodes = [];
    graphArray.edges.forEach((it) => {
      this.nodes.push(converFun(it));
    });
  }
}

export class Author {
  login: string;
  avatarUrl: string;

  constructor(apiAuthor: ApiAuthor) {
    this.login = apiAuthor.login;
    this.avatarUrl = apiAuthor.avatarUrl;
  }
}

export class ReactionGroup {
  content: string;
  viewerHasReacted: boolean;
  totalCount: number;
  subjectId: string;

  constructor(apiReactionGroup: ApiReactionGroup) {
    this.content = apiReactionGroup.content;
    this.viewerHasReacted = apiReactionGroup.viewerHasReacted;
    this.totalCount = apiReactionGroup.reactors.totalCount;
    this.subjectId = apiReactionGroup.subject.id;
  }
}

export class ReleaseAsset implements ConnectionItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  downloadUrl: string;
  size: number;
  contentType: string;
  cursor: string;

  constructor({ node, cursor }: ApiEdge<ApiReleaseAsset>) {
    this.id = node.id;
    this.name = node.name;
    this.createdAt = node.createdAt;
    this.updatedAt = node.updatedAt;
    this.downloadCount = node.downloadCount;
    this.downloadUrl = node.downloadUrl;
    this.size = node.size;
    this.contentType = node.contentType;
    this.cursor = cursor;
  }
}

export class Release {
  id: string;
  releaseAssets: PageArray<ReleaseAsset> = new PageArray;

  constructor(apiRelese: ApiRelease) {
    this.id = apiRelese.id;
    this.releaseAssets.updateAll(apiRelese.releaseAssets, (it) => new ReleaseAsset(it));
  }
}

export class Comment implements ConnectionItem {
  id: string;
  author: Author;
  body: string;
  bodyHTML: string;
  updatedAt: string;
  reactionGroups: ReactionGroup[];
  replies: PageArray<Comment> = new PageArray;
  cursor: string;

  constructor({ node, cursor }: ApiEdge<ApiComment>) {
    this.id = node.id;
    this.author = new Author(node.author);
    this.body = node.body;
    this.bodyHTML = node.bodyHTML;
    this.updatedAt = node.updatedAt;
    this.reactionGroups = node.reactionGroups.map((it) => new ReactionGroup(it));
    if (node.replies) {
      this.replies.updateAll(node.replies, (it) => new Comment(it));
    }
    this.cursor = cursor;
  }
}

export class Discussion {
  id: string;
  author: Author;
  title: string;
  bodyHTML: string;
  updatedAt: string;
  url: string;
  comments: PageArray<Comment> = new PageArray;
  reactionGroups: ReactionGroup[];

  constructor(apiDiscussion: ApiDiscussion) {
    this.id = apiDiscussion.id;
    this.author = new Author(apiDiscussion.author);
    this.title = apiDiscussion.title;
    this.bodyHTML = apiDiscussion.bodyHTML;
    this.updatedAt = apiDiscussion.updatedAt;
    this.url = apiDiscussion.url;
    this.comments.updateAll(apiDiscussion.comments, (it) => new Comment(it));
    this.reactionGroups = apiDiscussion.reactionGroups.map((it) => new ReactionGroup(it));
  }
}

export interface ApiMainData {
  updated: number,
  assets: ApiAsset[]
}

export interface ApiAsset {
  id: string
  name: string
  description: string
  cover?: string
  author: string
  category: string
  tags: string[]
  repo: string
  created: number
  updated: number
  downloadCount: number
  releaseNodeId: string
  discussionNodeId: string
}

export enum AssetStatus {
  NONE, DOWNLOADED, INTALLED
}

export class Asset {
  id: string;
  name: string;
  description: string;
  cover?: string;
  author: string;
  category: string;
  tags: string[];
  repo: string;
  created: number;
  updated: number;
  downloadCount: number;
  releaseNodeId: string;
  discussionNodeId: string;
  existOnline: boolean;
  versions: Map<string, AssetStatus>;

  constructor(apiAsset: ApiAsset) {
    this.id = apiAsset.id;
    this.name = apiAsset.name;
    this.description = apiAsset.description;
    this.cover = apiAsset.cover;
    this.author = apiAsset.author;
    this.category = apiAsset.category;
    this.tags = apiAsset.tags;
    this.repo = apiAsset.repo;
    this.created = apiAsset.created;
    this.updated = apiAsset.updated;
    this.downloadCount = apiAsset.downloadCount;
    this.releaseNodeId = apiAsset.releaseNodeId;
    this.discussionNodeId = apiAsset.discussionNodeId;
    this.existOnline = true;
    this.versions = new Map();
  }

  updateFromRemote(newAsset: Asset) {
    this.id = newAsset.id;
    this.name = newAsset.name;
    this.description = newAsset.description;
    this.cover = newAsset.cover;
    this.author = newAsset.author;
    this.category = newAsset.category;
    this.tags = newAsset.tags;
    this.repo = newAsset.repo;
    this.created = newAsset.created;
    this.updated = newAsset.updated;
    this.downloadCount = newAsset.downloadCount;
    this.releaseNodeId = newAsset.releaseNodeId;
    this.discussionNodeId = newAsset.discussionNodeId;
    this.existOnline = true;
  }
}

export interface MyProgress {
  url: string;
  percent: number;
  transferredBytes: number;
  totalBytes: number;
}
