export interface ApiEdge<T> {
  cursor: string
  node: T
}

export interface GraphArray<T> {
  totalCount: number
  edges: ApiEdge<T>[]
}

export function arrayPackage(nodeFields: string) {
  return `
edges {
  cursor
  node {
    ${nodeFields}
  }
}`;
}

export interface ApiReleaseAsset {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  downloadCount: number
  downloadUrl: string
  size: number
}

export const releaseAssetFields = `
fragment releaseAssetFields on ReleaseAsset {
  id
  name
  createdAt
  updatedAt
  downloadCount
  downloadUrl
  size
}`;

export interface ApiRelease {
  id: string
  author: ApiAuthor
  name: string
  descriptionHTML: string
  updatedAt: string
  releaseAssets: GraphArray<ApiReleaseAsset>
  reactionGroups: ApiReactionGroup[]
}

export const releaseFields = `
fragment releaseFields on Release {
  id
  author {
    ...authorFields
  }
  name
  descriptionHTML
  updatedAt
  releaseAssets(last: 10) {
    ${arrayPackage('...releaseAssetFields')}
  }
  reactionGroups {
    ...reactionGroupsFields
  }
}`;

export interface ApiAuthor {
  login: string
  avatarUrl: string
}

export const authorFields = `
fragment authorFields on Actor {
  login
  avatarUrl
}`;

export interface ApiComment {
  id: string
  author: ApiAuthor
  body: string
  bodyHTML: string
  updatedAt: string
  reactionGroups: ApiReactionGroup[]
  replies?: GraphArray<ApiComment>
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

export interface ApiDiscussion {
  id: string
  url: string
  comments: GraphArray<ApiComment>
}

export const discussionFields = `
fragment discussionFields on Discussion {
  id
  url
  comments(first: 10) {
    totalCount
    ${arrayPackage(`
      ...discussionCommentFields
      replies(first: 10) {
        totalCount
        ${arrayPackage('...discussionCommentFields')}
      }`)}
  }
}`;

export interface ApiReactionGroup {
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
