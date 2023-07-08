import { ApiAuthor, ApiComment, ApiDiscussion, ApiEdge, ApiReactionGroup, ApiRelease, ApiReleaseAsset, GraphArray } from './GraphqlClass';

interface ConnectionItem {
  cursor: string
}

export class PageArray<T extends ConnectionItem> {
  totalCount = 0;
  nodes: T[] = [];

  public isFull(): boolean {
    if (this.nodes.length > this.totalCount) throw Error('PageArray nodes size greate totalCount!');
    return this.nodes.length == this.totalCount;
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
  cursor: string;

  constructor({ node, cursor }: ApiEdge<ApiReleaseAsset>) {
    this.id = node.id;
    this.name = node.name;
    this.createdAt = node.createdAt;
    this.updatedAt = node.updatedAt;
    this.downloadCount = node.downloadCount;
    this.downloadUrl = node.downloadUrl;
    this.size = node.size;
    this.cursor = cursor;
  }
}

export class Release {
  id: string;
  author: Author;
  name: string;
  descriptionHTML: string;
  updatedAt: string;
  releaseAssets: PageArray<ReleaseAsset> = new PageArray;
  reactionGroups: ReactionGroup[];

  constructor(apiRelese: ApiRelease) {
    this.id = apiRelese.id;
    this.author = apiRelese.author;
    this.name = apiRelese.name;
    this.descriptionHTML = apiRelese.descriptionHTML;
    this.updatedAt = apiRelese.updatedAt;
    this.releaseAssets.updateAll(apiRelese.releaseAssets, (it) => new ReleaseAsset(it));
    this.reactionGroups = apiRelese.reactionGroups.map((it) => new ReactionGroup(it));
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
    this.author = node.author;
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
  url: string;
  comments: PageArray<Comment> = new PageArray;

  constructor(apiDiscussion: ApiDiscussion) {
    this.id = apiDiscussion.id;
    this.url = apiDiscussion.url;
    this.comments.updateAll(apiDiscussion.comments, (it) => new Comment(it));
  }
}
