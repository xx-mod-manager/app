import { defineStore } from 'pinia';
import { ApiComment } from 'src/class/GraphqlClass';
import { Comment, Discussion, Game, OnlineResourceDetail, Release } from 'src/class/Types';
import { deleteArrayItemByFieldId, findArrayItemByFieldId, findArrayItemById } from 'src/utils/ArrayUtils';
import { ref } from 'vue';

const KEY_TEMP_DATA = 'tempData';
const REFRESH_TIME = 1000 * 60 * 10;

export const useTempDataStore = defineStore(KEY_TEMP_DATA, () => {
  const online = ref(true);
  const gamesDate = ref(undefined as undefined | number);
  const games = ref([] as TempGame[]);

  function getOptionTempGameById(id: string): TempGame | undefined {
    return findArrayItemById(games.value, id);
  }

  function getTempGameById(id: string): TempGame {
    const game = getOptionTempGameById(id);
    if (game == undefined) throw Error(`Miss game [${id}]`);
    return game;
  }

  function getOptionReleaseById(gameId: string, releaseId: string): Release | undefined {
    return findArrayItemById(getOptionTempGameById(gameId)?.releases, releaseId);
  }

  function getOptionDiscussionById(gameId: string, discussionId: string): Discussion | undefined {
    return findArrayItemById(getOptionTempGameById(gameId)?.discussions, discussionId);
  }

  function getOptionResourceDetail(gameId: string, releaseId: string, discussionId: string): { release: Release; discussion: Discussion } | undefined {
    const release = getOptionReleaseById(gameId, releaseId);
    const discussion = getOptionDiscussionById(gameId, discussionId);
    if (release != undefined && discussion != undefined) {
      return { release, discussion };
    } else {
      return undefined;
    }
  }

  function getDiscussionById(gameId: string, discussionId: string): Discussion {
    const discussion = findArrayItemById(getTempGameById(gameId).discussions, discussionId);
    if (discussion == undefined) throw Error(`Miss discussion [${gameId}]/[${discussionId}]`);
    return discussion;
  }

  function getCommentById(gameId: string, discussionId: string, commentId: string): Comment {
    const comment = findArrayItemById(getDiscussionById(gameId, discussionId).comments.nodes, commentId);
    if (comment == undefined) throw Error(`Miss comment [${gameId}]/[${discussionId}]/[${commentId}]`);
    return comment;
  }

  function getReplyById(gameId: string, discussionId: string, commentId: string, replyId: string): Comment {
    const reply = findArrayItemById(getCommentById(gameId, discussionId, commentId).replies.nodes, replyId);
    if (reply == undefined) throw Error(`Miss reply [${gameId}]/[${discussionId}]/[${commentId}]/[${replyId}]`);
    return reply;
  }

  function needRefreshGames(): boolean {
    if (!online.value) return false;
    if (gamesDate.value == undefined) return true;
    return gamesDate.value + REFRESH_TIME < Date.now();
  }

  function needRefreshResources(gameId: string): boolean {
    if (!online.value) return false;
    const onlineGame = getTempGameById(gameId);
    if (onlineGame.resourcesDate == undefined) return true;
    return onlineGame.resourcesDate + REFRESH_TIME < Date.now();
  }

  function needRefreshResourceManage(gameId: string): boolean {
    const onlineGame = getTempGameById(gameId);
    return onlineGame.resourceManageDate == undefined;
  }

  function needRefreshResource(gameId: string, releaseId: string, discussionId: string): boolean {
    if (!online.value) return false;
    const release = getOptionReleaseById(gameId, releaseId);
    const discussion = getOptionDiscussionById(gameId, discussionId);
    return release == undefined || discussion == undefined;
  }

  function initLocalGames(localGames: Game[]) {
    localGames.forEach((onlineGame) => {
      games.value.push({ id: onlineGame.id, releases: [], discussions: [] });
    });
  }

  function updateTempGames(onlineGames: Game[]) {
    gamesDate.value = Date.now();
    for (const onlineGame of onlineGames) {
      const oldOnlineGame = getOptionTempGameById(onlineGame.id);
      if (oldOnlineGame === undefined) {
        games.value.push({ id: onlineGame.id, releases: [], discussions: [] });
      }
    };
  }

  function updateResources(gameId: string) {
    const onlineGame = getTempGameById(gameId);
    onlineGame.resourcesDate = Date.now();
  }

  function updateResourceManage(gameId: string) {
    const onlineGame = getTempGameById(gameId);
    onlineGame.resourceManageDate = Date.now();
  }

  function updateResourceDetail(gameId: string, newResourceDetail: OnlineResourceDetail) {
    const game = getTempGameById(gameId);
    const oldRelease = findArrayItemByFieldId(game.releases, newResourceDetail.release);
    const oldDiscussion = findArrayItemByFieldId(game.discussions, newResourceDetail.discussion);
    if (oldRelease !== undefined) deleteArrayItemByFieldId(game.releases, oldRelease);
    if (oldDiscussion !== undefined) deleteArrayItemByFieldId(game.releases, oldDiscussion);
    game.releases.push(newResourceDetail.release);
    game.discussions.push(newResourceDetail.discussion);
  }

  function deleteComment(gameId: string, discussionId: string, commentId: string, commentSize: number) {
    const discussion = getDiscussionById(gameId, discussionId);
    discussion.comments.deleteNode(commentSize, commentId);
  }

  function updateComment(gameId: string, discussionId: string, commentId: string, newComment: ApiComment) {
    const comment = getCommentById(gameId, discussionId, commentId);
    comment.body = newComment.body;
    comment.bodyHTML = newComment.bodyHTML;
    comment.updatedAt = newComment.updatedAt;
    comment.id = newComment.id;
  }

  function deleteReply(gameId: string, discussionId: string, commentId: string, deletedReplyId: string, replySize: number) {
    const comment = getCommentById(gameId, discussionId, commentId);
    comment.replies.deleteNode(replySize, deletedReplyId);
  }

  function updateReply(gameId: string, discussionId: string, commentId: string, replyId: string, newReply: ApiComment) {
    const comment = getReplyById(gameId, discussionId, commentId, replyId);
    comment.body = newReply.body;
    comment.bodyHTML = newReply.bodyHTML;
    comment.updatedAt = newReply.updatedAt;
    comment.id = newReply.id;
  }

  return {
    online,
    gamesDate,
    games,
    getOptionTempGameById,
    getTempGameById,
    getOptionReleaseById,
    getOptionDiscussionById,
    getOptionResourceDetail,
    getDiscussionById,
    getCommentById,
    getReplyById,
    needRefreshGames,
    needRefreshResources,
    needRefreshResourceManage,
    needRefreshResource,
    initLocalGames,
    updateTempGames,
    updateResources,
    updateResourceManage,
    updateResourceDetail,
    deleteComment,
    updateComment,
    deleteReply,
    updateReply
  };
});

interface TempGame {
  id: string
  resourcesDate?: number
  resourceManageDate?: number
  releases: Release[]
  discussions: Discussion[]
}
