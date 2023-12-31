import { api } from 'boot/axios';
import { myLogger } from 'src/boot/logger';
import 'src/class/GraphqlClass';
import { ApiAuthor, ApiComment, ApiDiscussion, ApiReactionGroup, ApiRelease, GraphArray, arrayPackage, getFragment } from 'src/class/GraphqlClass';
import { Resource } from 'src/class/Resource';
import { Author, Comment, Discussion, PageArray, ReactionGroup, Release } from 'src/class/Types';
import { useAuthDataStore } from 'src/stores/AuthData';

const GRAPHQL_URL = 'https://api.github.com/graphql';

async function sendGraphql(query: string) {
  myLogger.debug(`Graphql query is \n${query}`);
  query += getFragment(query);
  const authData = useAuthDataStore();
  const response = await api.post(GRAPHQL_URL, { query },
    { headers: { Authorization: authData.token } }
  );
  myLogger.debug('Graphql result is', response.data);
  return response.data.data;
}

function joinQuery(arg: (string | undefined)[]): string {
  return `["${arg.join('\",\"')}"]`;
}

export async function getResourceDetail(resource: Resource): Promise<{ release: Release, discussion: Discussion }> {
  const queres = [resource.releaseNodeId];
  if (resource.discussionNodeId) queres.push(resource.discussionNodeId);
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
}`;
  const data = await sendGraphql(query);
  const nodes = data.nodes as (ApiRelease | (ApiDiscussion | undefined))[];
  let release: ApiRelease | undefined = undefined;
  let discussion: ApiDiscussion | undefined = undefined;

  nodes.forEach((data) => {
    if (data) {
      if ('url' in data) {
        discussion = data;
      } else {
        release = data;
      }
    }
  });

  if (release && discussion) {
    return { release: new Release(release), discussion: new Discussion(discussion) };
  } else {
    throw Error('getAssetDetail miss release or discussion!');
  }
}

export async function getCurrentAuthor(): Promise<Author> {
  const query = `
{
  viewer {
    ...authorFields
  }
}`;
  const data = await sendGraphql(query);
  const viewer: ApiAuthor = data.viewer;
  return new Author(viewer);
}

export async function addReaction(subjectId: string, content: string): Promise<ReactionGroup[]> {
  const query = `
mutation {
  addReaction(input: {subjectId: "${subjectId}", content: ${content}}) {
    reactionGroups {
      ...reactionGroupsFields
    }
  }
}`;
  const data = await sendGraphql(query);

  const apiReactionGroups: ApiReactionGroup[] = data.addReaction.reactionGroups;

  return apiReactionGroups.map((it) => new ReactionGroup(it));
}

export async function removeReaction(subjectId: string, content: string): Promise<ReactionGroup[]> {
  const query = `
mutation {
  removeReaction(input: {subjectId: "${subjectId}", content: ${content}}) {
    reactionGroups {
      ...reactionGroupsFields
    }
  }
}`;
  const data = await sendGraphql(query);

  const apiReactionGroups: ApiReactionGroup[] = data.removeReaction.reactionGroups;

  return apiReactionGroups.map((it) => new ReactionGroup(it));
}

export async function loadDiscussionComment(discussionId: string, comments: PageArray<Comment>) {
  if (comments.totalCount == 0 || comments.isFull() || comments.nodes.length == 0) return;
  const endCursor = comments.nodes[comments.nodes.length - 1].cursor;
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
          replies(first: 5) {
            totalCount
            ${arrayPackage('...discussionCommentFields')}
          }`)}
      }
    }
  }
}`;
  const data = await sendGraphql(query);
  const apiComments: GraphArray<ApiComment> = data.node.comments;
  comments.loadAll(apiComments, (value) => new Comment(value));
}

export async function addDiscussionComment(body: string, discussionId: string, comments: PageArray<Comment>) {
  let endCursor: string | undefined = undefined;
  if (comments.totalCount > 0) endCursor = comments.nodes[comments.nodes.length - 1].cursor;
  const query = `
mutation {
  addDiscussionComment(
    input: {body: "${body}", discussionId: "${discussionId}"}
  ) {
    comment {
      discussion {
        comments(
          first: 10
          ${endCursor != undefined ? `after: "${endCursor}"` : ''}
        ) {
          totalCount
          ${arrayPackage(`
            ...discussionCommentFields
            replies(first: 5) {
              totalCount
              ${arrayPackage('...discussionCommentFields')}
            }`)}
        }
      }
    }
  }
}`;
  const data = await sendGraphql(query);

  const apiComments: GraphArray<ApiComment> = data.addDiscussionComment.comment.discussion.comments;
  comments.loadAll(apiComments, (value) => new Comment(value));
}

export async function deleteDiscussionComment(id: string): Promise<{ totalCount: number, deletedCommentId: string }> {
  const query = `
mutation {
  deleteDiscussionComment(
    input: {id: "${id}"}
  ) {
    comment {
      id
      discussion {
        comments {
          totalCount
        }
      }
    }
  }
}`;
  const data = await sendGraphql(query);
  const deletedCommentId: string = data.deleteDiscussionComment.comment.id;
  const totalCount: number = data.deleteDiscussionComment.comment.discussion.comments.totalCount;
  return { totalCount, deletedCommentId };
}

export async function updateDiscussionComment(body: string, commentId: string): Promise<ApiComment> {
  const query = `
mutation {
  updateDiscussionComment(input: {body: "${body}", commentId: "${commentId}"}) {
    comment {
      ...discussionCommentFields
    }
  }
}`;
  const data = await sendGraphql(query);

  const apiComment: ApiComment = data.updateDiscussionComment.comment;

  return apiComment;
}

export async function loadDiscussionReply(discussionId: string, replies: PageArray<Comment>) {
  if (replies.totalCount == 0 || replies.isFull() || replies.nodes.length == 0) return;
  const endCursor = replies.nodes[replies.nodes.length - 1].cursor;
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
}`;
  const data = await sendGraphql(query);
  const apiReplies: GraphArray<ApiComment> = data.node.replies;
  replies.loadAll(apiReplies, (value) => new Comment(value));
}

export async function addDiscussionReply(body: string, discussionId: string, commentId: string, replies: PageArray<Comment>) {
  let endCursor: string | undefined = undefined;
  if (replies.totalCount > 0) endCursor = replies.nodes[replies.nodes.length - 1].cursor;
  const query = `
mutation {
  addDiscussionComment(input: {body: "${body}", discussionId: "${discussionId}", replyToId: "${commentId}"}) {
    comment {
      replyTo {
        replies(
          first: 100
          ${endCursor ? `after: "${endCursor}"` : ''}
        ) {
          totalCount
          ${arrayPackage('...discussionCommentFields')}
        }
      }
    }
  }
}`;
  const data = await sendGraphql(query);

  const apiReplies: GraphArray<ApiComment> = data.addDiscussionComment.comment.replyTo.replies;
  replies.loadAll(apiReplies, (value) => new Comment(value));
}

export async function deleteDiscussionReply(id: string): Promise<{ totalCount: number, deletedReplyId: string }> {
  const query = `
mutation {
  deleteDiscussionComment(input: {id: "${id}"}) {
    comment {
      id
      replyTo {
        replies {
          totalCount
        }
      }
    }
  }
}`;
  const data = await sendGraphql(query);

  const deletedReplyId: string = data.deleteDiscussionComment.comment.id;
  const totalCount: number = data.deleteDiscussionComment.comment.replyTo.replies.totalCount;
  return { totalCount, deletedReplyId };
}

export async function updateDiscussionReply(body: string, commentId: string): Promise<ApiComment> {
  const query = `
mutation {
  updateDiscussionComment(input: {body: "${body}", commentId: "${commentId}"}) {
    comment {
      ...discussionCommentFields
    }
  }
}`;
  const data = await sendGraphql(query);

  const apiComment: ApiComment = data.updateDiscussionComment.comment;

  return apiComment;
}
