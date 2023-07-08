import 'src/class/GraphqlClass';
import { api } from 'boot/axios';
import { Discussion, ReactionGroup, Release, authorFields, discussionCommentFields, reactionGroupsFields, releaseAssetFields, Comment, Replie } from 'src/class/GraphqlClass';
import { useAuthDataStore } from 'src/stores/AuthData';
import { Mod } from 'src/class/Mod';
import { myLogger } from 'src/boot/logger';

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
      id
      author {
        ...authorFields
      }
      name
      descriptionHTML
      updatedAt
      releaseAssets(last: 10) {
        nodes {
          ...releaseAssetFields
        }
      }
      reactionGroups {
        ...reactionGroupsFields
      }
    }
    ... on Discussion {
      id
      comments(first: 10) {
        totalCount
        nodes {
          ...discussionCommentFields
          replies(first: 10) {
            totalCount
            nodes {
              ...discussionCommentFields
            }
          }
        }
      }
    }
  }
}` + authorFields + reactionGroupsFields + discussionCommentFields + releaseAssetFields;
  const response = await api.post(GRAPHQL_URL, { query }, {
    headers: {
      Authorization: authData.token
    }
  });
  const datas = response.data.data.nodes as (Release | (Discussion | undefined))[];
  let release: Release | undefined = undefined;
  let discussion: Discussion | undefined = undefined;

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
    return { release, discussion };
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

  return response.data.data.addReaction.reactionGroups;
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

  return response.data.data.removeReaction.reactionGroups;
}

export async function addDiscussionComment(body: string, discussionId: string): Promise<Comment> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  addDiscussionComment(
    input: {body: "${body}", discussionId: "${discussionId}"}
  ) {
    comment {
      ...discussionCommentFields
      replies(first: 10) {
        totalCount
        nodes {
          ...discussionCommentFields
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

  return response.data.data.addDiscussionComment.comment;
}

export async function addDiscussionReply(body: string, discussionId: string, commentId: string): Promise<Replie> {
  const authData = useAuthDataStore();
  const query = `
mutation {
  addDiscussionComment(
    input: {body: "${body}", discussionId: "${discussionId}", replyToId: "${commentId}"}
  ) {
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

  return response.data.data.addDiscussionComment.comment;
}
