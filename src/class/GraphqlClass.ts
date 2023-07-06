export interface GraphArray<T> {
  totalCount: number
  nodes: T[]
}

export interface ReleaseAsset {
  name: string
  createdAt: string
  updatedAt: string
  downloadCount: number
  downloadUrl: string
}

export interface Release {
  id: string
  author: Author
  name: string
  descriptionHTML: string
  updatedAt: string
  releaseAssets: GraphArray<ReleaseAsset>
  reactionGroups: ReactionGroup[]
}

export interface Author {
  login: string
  avatarUrl: string
}

export interface Replie {
  id: string
  author: Author
  bodyHTML: string
  updatedAt: string
  reactionGroups: ReactionGroup[]
}

export interface Comment {
  id: string
  author: Author
  bodyHTML: string
  updatedAt: string
  replies: GraphArray<Replie>
  reactionGroups: ReactionGroup[]
}

export interface Discussion {
  id: string
  comments: GraphArray<Comment>
}

export interface ReactionGroup {
  content: string,
  viewerHasReacted: boolean,
  reactors: {
    totalCount: number
  }
}
