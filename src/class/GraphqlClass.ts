export interface GraphArray<T> {
  totalCount: number
  nodes: T[]
}

export interface ReleaseAsset {
  name: string
  createdAt: Date
  updatedAt: Date
  downloadCount: number
  downloadUrl: string
}

export interface Release {
  id: string
  name: string
  descriptionHTML: string
  releaseAssets: GraphArray<ReleaseAsset>
}

export interface Author {
  login: string
  avatarUrl: string
}

export interface Replie {
  id: string
  author: Author
  bodyHTML: string
  updatedAt: Date
}

export interface Comment {
  id: string
  author: Author
  bodyHTML: string
  updatedAt: Date
  replies: GraphArray<Replie>
}

export interface Discussion {
  id: string
  comments: GraphArray<Comment>
}
