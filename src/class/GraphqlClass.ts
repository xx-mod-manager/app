export interface GraphArray<T> {
  totalCount: number
  nodes: T[]
}

export interface ReleaseAsset {
  name: string
  updatedAt: Date
  downloadCount: number
  downloadUrl: string
}

export interface Release {
  id: string
  name: string
  description: string
  releaseAssets: GraphArray<ReleaseAsset>
}

export interface Author {
  login: string
  avatarUrl: string
}

export interface Replie {
  author: Author
  body: string
  updateAt: Date
}

export interface Comment {
  id: string
  author: Author
  body: string
  updateAt: Date
  replies: GraphArray<Replie>
}

export interface Discussion {
  id: string
  comments: GraphArray<Comment>
}
