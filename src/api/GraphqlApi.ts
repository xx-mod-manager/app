import 'src/class/GraphqlClass';
import { api } from 'boot/axios';
import { ApiDiscussion, ApiReactionGroup, ApiRelease, authorFields, discussionCommentFields, reactionGroupsFields, releaseAssetFields, releaseFields, discussionFields, ApiComment, arrayPackage, GraphArray } from 'src/class/GraphqlClass';
import { useAuthDataStore } from 'src/stores/AuthData';
import { Mod } from 'src/class/Mod';
import { myLogger } from 'src/boot/logger';
import { Discussion, ReactionGroup, Release, Comment, PageArray } from 'src/class/Types';

const GRAPHQL_URL = 'https://api.github.com/graphql';

function joinQuery(arg: string[]): string {
  return `["${arg.join('\",\"')}"]`;
}

export async function getModDetail(mod: Mod): Promise<{ release: Release, discussion: Discussion | undefined }> {
  const authData = useAuthDataStore();
  const queres = [mod.id];
  if (mod.discussion_id) queres.push(mod.discussion_id);
  const queryArg = joinQuery(queres);
  const query = `
{
  nodes(ids: ${queryArg}) {
    ... on Release {
      ...releaseFields
    }
    ... on Discussion {
      ...discussionFields
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields + releaseAssetFields + releaseFields + discussionFields;
  const response = await api.post(GRAPHQL_URL, { query }, {
    headers: {
      Authorization: authData.token
    }
  });
  myLogger.debug(response.data);
  const datas = response.data.data.nodes as (ApiRelease | (ApiDiscussion | undefined))[];
  let release: ApiRelease | undefined = undefined;
  let discussion: ApiDiscussion | undefined = undefined;

  datas.forEach((data) => {
    if (data) {
      if ('name' in data) {
        release = data;
      } else {
        discussion = data;
      }
    }
  });

  if (release) {
    return { release: new Release(release), discussion: discussion ? new Discussion(discussion) : undefined };
  } else {
    throw Error('getModDetail miss release!');
  }
}

export async function addReaction(subjectId: string, content: string): Promise<ReactionGroup[]> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  addReaction(input: {subjectId: "${subjectId}", content: ${content}}) {
    reactionGroups {
      ...reactionGroupsFields
    }
  }
}` + reactionGroupsFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiReactionGroups: ApiReactionGroup[] = response.data.data.addReaction.reactionGroups;

  return apiReactionGroups.map((it) => new ReactionGroup(it));
}

export async function removeReaction(subjectId: string, content: string): Promise<ReactionGroup[]> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  removeReaction(input: {subjectId: "${subjectId}", content: ${content}}) {
    reactionGroups {
      ...reactionGroupsFields
    }
  }
}` + reactionGroupsFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiReactionGroups: ApiReactionGroup[] = response.data.data.removeReaction.reactionGroups;

  return apiReactionGroups.map((it) => new ReactionGroup(it));
}

export async function loadDiscussionComment(discussionId: string, comments: PageArray<Comment>) {
  if (comments.totalCount == 0 || comments.isFull() || comments.nodes.length == 0) return;
  const endCursor = comments.nodes[comments.nodes.length - 1].cursor;
  const authData = useAuthDataStore();
  const query = `
{
  node(id: "${discussionId}") {
    ... on Discussion {
      comments(
        first: 10
        after: "${endCursor}"
      ) {
        totalCount
        ${arrayPackage(`
          ...discussionCommentFields
          replies(first: 10) {
            totalCount
            ${arrayPackage('...discussionCommentFields')}
          }`)}
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields;
  const response = await api.post(GRAPHQL_URL, { query }, {
    headers: {
      Authorization: authData.token
    }
  });
  const apiComments: GraphArray<ApiComment> = response.data.data.node.comments;
  comments.loadAll(apiComments, (value) => new Comment(value));
}

export async function addDiscussionComment(body: string, discussionId: string): Promise<Discussion> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  addDiscussionComment(
    input: {body: "${body}", discussionId: "${discussionId}"}
  ) {
    comment {
      discussion {
        ...discussionFields
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields + discussionFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiDiscussion: ApiDiscussion = response.data.data.addDiscussionComment.comment.discussion;
  return new Discussion(apiDiscussion);
}

export async function deleteDiscussionComment(id: string): Promise<Discussion> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  deleteDiscussionComment(
    input: {id: "${id}"}
  ) {
    comment {
      discussion {
        ...discussionFields
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields + discussionFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiDiscussion: ApiDiscussion = response.data.data.deleteDiscussionComment.comment.discussion;
  return new Discussion(apiDiscussion);
}

export async function updateDiscussionComment(body: string, commentId: string): Promise<ApiComment> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  updateDiscussionComment(input: {body: "${body}", commentId: "${commentId}"}) {
    comment {
      ...discussionCommentFields
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiComment: ApiComment = response.data.data.updateDiscussionComment.comment;

  return apiComment;
}

export async function loadDiscussionReply(discussionId: string, comments: PageArray<Comment>) {
  if (comments.totalCount == 0 || comments.isFull() || comments.nodes.length == 0) return;
  const endCursor = comments.nodes[comments.nodes.length - 1].cursor;
  const authData = useAuthDataStore();
  const query = `
{
  node(id: "${discussionId}") {
    ... on DiscussionComment {
      replies(
        first: 10
        after: "${endCursor}"
      ) {
        totalCount
        ${arrayPackage('...discussionCommentFields')}
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields;
  const response = await api.post(GRAPHQL_URL, { query }, {
    headers: {
      Authorization: authData.token
    }
  });
  const apiComments: GraphArray<ApiComment> = response.data.data.node.replies;
  comments.loadAll(apiComments, (value) => new Comment(value));
}

export async function addDiscussionReply(body: string, discussionId: string, commentId: string): Promise<Comment> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  addDiscussionComment(input: {body: "${body}", discussionId: "${discussionId}", replyToId: "${commentId}"}) {
    comment {
      replyTo {
        ...discussionCommentFields
        replies(first: 10) {
          totalCount
          ${arrayPackage('...discussionCommentFields')}
        }
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiComment: ApiComment = response.data.data.addDiscussionComment.comment.replyTo;
  return new Comment({ node: apiComment, cursor: '' });
}

export async function deleteDiscussionReply(id: string): Promise<Comment> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  deleteDiscussionComment(input: {id: "${id}"}) {
    comment {
      replyTo {
        ...discussionCommentFields
        replies(first: 10) {
          totalCount
          ${arrayPackage('...discussionCommentFields')}
        }
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiComment: ApiComment = response.data.data.deleteDiscussionComment.comment.replyTo;
  return new Comment({ node: apiComment, cursor: '' });
}

export async function updateDiscussionReply(body: string, commentId: string): Promise<ApiComment> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  updateDiscussionComment(input: {body: "${body}", commentId: "${commentId}"}) {
    comment {
      ...discussionCommentFields
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields;
  const response = await api.post(GRAPHQL_URL, { query },
    {
      headers: {
        Authorization: authData.token
      }
    });

  myLogger.debug(response.data);

  const apiComment: ApiComment = response.data.data.updateDiscussionComment.comment;

  return apiComment;
}
