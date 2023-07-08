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

export const releaseAssetFields = `
fragment releaseAssetFields on ReleaseAsset {
  id
  name
  createdAt
  updatedAt
  downloadCount
  downloadUrl
}`;

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

export const authorFields = `
fragment authorFields on Actor {
  login
  avatarUrl
}`;

export interface Replie {
  id: string
  author: Author
  body: string
  bodyHTML: string
  updatedAt: string
  reactionGroups: ReactionGroup[]
}

export const discussionCommentFields = `
fragment discussionCommentFields on DiscussionComment {
  id
  author {
    ...authorFields
  }
  body
  bodyHTML
  createdAt
  updatedAt
  reactionGroups {
    ...reactionGroupsFields
  }
}`;

export interface Comment {
  id: string
  author: Author
  body: string
  bodyHTML: string
  updatedAt: string
  reactionGroups: ReactionGroup[]
  replies: GraphArray<Replie>
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
  subject: {
    id: string
  }
}

export const reactionGroupsFields = `
fragment reactionGroupsFields on ReactionGroup {
  content
  viewerHasReacted
  reactors {
    totalCount
  }
  subject {
    id
  }
}`;
