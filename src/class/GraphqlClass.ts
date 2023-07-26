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
  contentType: string
}

const releaseAssetFields = `
fragment releaseAssetFields on ReleaseAsset {
  id
  name
  createdAt
  updatedAt
  downloadCount
  downloadUrl
  size
  contentType
}`;

export interface ApiRelease {
  id: string
  releaseAssets: GraphArray<ApiReleaseAsset>
}

const releaseFields = `
fragment releaseFields on Release {
  id
  releaseAssets(last: 10) {
    ${arrayPackage('...releaseAssetFields')}
  }
}`;

export interface ApiAuthor {
  login: string
  avatarUrl: string
}

const authorFields = `
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

const discussionCommentFields = `
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
  author: ApiAuthor
  title: string
  bodyHTML: string
  updatedAt: string
  url: string
  comments: GraphArray<ApiComment>
  reactionGroups: ApiReactionGroup[]
}

const discussionFields = `
fragment discussionFields on Discussion {
  id
  author {
    ...authorFields
  }
  title
  bodyHTML
  updatedAt
  url
  comments(first: 10) {
    totalCount
    ${arrayPackage(`
      ...discussionCommentFields
      replies(first: 2) {
        totalCount
        ${arrayPackage('...discussionCommentFields')}
      }`)}
  }
  reactionGroups {
    ...reactionGroupsFields
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

const reactionGroupsFields = `
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

interface Fragment { key: string, depend: Set<string>, value: string }

const fragments: Fragment[] = [
  { key: 'releaseAssetFields', depend: new Set(), value: releaseAssetFields },
  { key: 'reactionGroupsFields', depend: new Set(), value: reactionGroupsFields },
  { key: 'authorFields', depend: new Set(), value: authorFields },
  { key: 'releaseFields', depend: new Set(['releaseAssetFields']), value: releaseFields },
  { key: 'discussionCommentFields', depend: new Set(['reactionGroupsFields', 'authorFields']), value: discussionCommentFields },
  { key: 'discussionFields', depend: new Set(['discussionCommentFields', 'authorFields', 'reactionGroupsFields']), value: discussionFields },
];

export function getFragment(query: string): string {
  const fragmentSet: Set<Fragment> = new Set();
  fragments.forEach((fragment) => {
    if (query.includes(fragment.key)) {
      fragmentSet.add(fragment);
      getFragmentDepend(fragment).forEach((it) => {
        fragmentSet.add(it);
      });
    }
  });
  let result = '';
  fragmentSet.forEach((fragment) => {
    result += fragment.value;
  });
  return result;
}

function getFragmentDepend(fragment: Fragment): Set<Fragment> {
  const result: Set<Fragment> = new Set();
  fragment.depend.forEach((key) => {
    const depend = fragments.find((it) => it.key == key);
    if (depend) {
      result.add(depend);
      getFragmentDepend(depend).forEach((it) => {
        result.add(it);
      });
    }
  });
  return result;
}
