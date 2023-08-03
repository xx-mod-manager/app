import { defineStore } from 'pinia';
import { ApiComment } from 'src/class/GraphqlClass';
import { Comment, Discussion, Game, OnlineResourceDetail, Release } from 'src/class/Types';
import { deleteArrayItemByFieldId, findArrayItemByFieldId, findArrayItemById } from 'src/utils/ArrayUtils';

const KEY_TEMP_DATA = 'tempData';
const REFRESH_TIME = 1000 * 60 * 10;

export const useTempDataStore = defineStore(KEY_TEMP_DATA, {
  state: init,

  getters: {},

  actions: {
    getOptionTempGameById(id: string): TempGame | undefined {
      return findArrayItemById(this.games, id);
    },

    getTempGameById(id: string): TempGame {
      const game = this.getOptionTempGameById(id);
      if (game == undefined) throw Error(`Miss game [${id}]`);
      return game;
    },

    getOptionReleaseById(gameId: string, releaseId: string): Release | undefined {
      return findArrayItemById(this.getOptionTempGameById(gameId)?.releases, releaseId);
    },

    getOptionDiscussionById(gameId: string, discussionId: string): Discussion | undefined {
      return findArrayItemById(this.getOptionTempGameById(gameId)?.discussions, discussionId);
    },

    getOptionResourceDetail(gameId: string, releaseId: string, discussionId: string): { release: Release; discussion: Discussion } | undefined {
      const release = this.getOptionReleaseById(gameId, releaseId);
      const discussion = this.getOptionDiscussionById(gameId, discussionId);
      if (release != undefined && discussion != undefined) {
        return { release, discussion };
      } else {
        return undefined;
      }
    },

    getDiscussionById(gameId: string, discussionId: string): Discussion {
      const discussion = findArrayItemById(this.getTempGameById(gameId).discussions, discussionId);
      if (discussion == undefined) throw Error(`Miss discussion [${gameId}]/[${discussionId}]`);
      return discussion;
    },

    getCommentById(gameId: string, discussionId: string, commentId: string): Comment {
      const comment = findArrayItemById(this.getDiscussionById(gameId, discussionId).comments.nodes, commentId);
      if (comment == undefined) throw Error(`Miss comment [${gameId}]/[${discussionId}]/[${commentId}]`);
      return comment;
    },

    getReplyById(gameId: string, discussionId: string, commentId: string, replyId: string): Comment {
      const reply = findArrayItemById(this.getCommentById(gameId, discussionId, commentId).replies.nodes, replyId);
      if (reply == undefined) throw Error(`Miss reply [${gameId}]/[${discussionId}]/[${commentId}]/[${replyId}]`);
      return reply;
    },

    needRefreshGames(): boolean {
      if (!this.online) return false;
      if (this.gamesDate == undefined) return true;
      return this.gamesDate + REFRESH_TIME < Date.now();
    },

    needRefreshResources(gameId: string): boolean {
      if (!this.online) return false;
      const onlineGame = this.getTempGameById(gameId);
      if (onlineGame.resourcesDate == undefined) return true;
      return onlineGame.resourcesDate + REFRESH_TIME < Date.now();
    },

    needRefreshResourceManage(gameId: string): boolean {
      const onlineGame = this.getTempGameById(gameId);
      return onlineGame.resourceManageDate == undefined;
    },

    needRefreshResource(gameId: string, releaseId: string, discussionId: string): boolean {
      if (!this.online) return false;
      const release = this.getOptionReleaseById(gameId, releaseId);
      const discussion = this.getOptionDiscussionById(gameId, discussionId);
      return release == undefined || discussion == undefined;
    },

    initLocalGames(localGames: Game[]) {
      localGames.forEach((onlineGame) => {
        this.games.push({ id: onlineGame.id, releases: [], discussions: [] });
      });
    },

    updateTempGames(onlineGames: Game[]) {
      this.gamesDate = Date.now();
      for (const onlineGame of onlineGames) {
        const oldOnlineGame = this.getOptionTempGameById(onlineGame.id);
        if (oldOnlineGame === undefined) {
          this.games.push({ id: onlineGame.id, releases: [], discussions: [] });
        }
      };
    },

    updateResources(gameId: string) {
      const onlineGame = this.getTempGameById(gameId);
      onlineGame.resourcesDate = Date.now();
    },

    updateResourceManage(gameId: string) {
      const onlineGame = this.getTempGameById(gameId);
      onlineGame.resourceManageDate = Date.now();
    },

    updateResourceDetail(gameId: string, newResourceDetail: OnlineResourceDetail) {
      const game = this.getTempGameById(gameId);
      const oldRelease = findArrayItemByFieldId(game.releases, newResourceDetail.release);
      const oldDiscussion = findArrayItemByFieldId(game.discussions, newResourceDetail.discussion);
      if (oldRelease !== undefined) deleteArrayItemByFieldId(game.releases, oldRelease);
      if (oldDiscussion !== undefined) deleteArrayItemByFieldId(game.releases, oldDiscussion);
      game.releases.push(newResourceDetail.release);
      game.discussions.push(newResourceDetail.discussion);
    },

    deleteComment(gameId: string, discussionId: string, commentId: string, commentSize: number) {
      const discussion = this.getDiscussionById(gameId, discussionId);
      discussion.comments.deleteNode(commentSize, commentId);
    },

    updateComment(gameId: string, discussionId: string, commentId: string, newComment: ApiComment) {
      const comment = this.getCommentById(gameId, discussionId, commentId);
      comment.body = newComment.body;
      comment.bodyHTML = newComment.bodyHTML;
      comment.updatedAt = newComment.updatedAt;
      comment.id = newComment.id;
    },

    deleteReply(gameId: string, discussionId: string, commentId: string, deletedReplyId: string, replySize: number) {
      const comment = this.getCommentById(gameId, discussionId, commentId);
      comment.replies.deleteNode(replySize, deletedReplyId);
    },

    updateReply(gameId: string, discussionId: string, commentId: string, replyId: string, newReply: ApiComment) {
      const comment = this.getReplyById(gameId, discussionId, commentId, replyId);
      comment.body = newReply.body;
      comment.bodyHTML = newReply.bodyHTML;
      comment.updatedAt = newReply.updatedAt;
      comment.id = newReply.id;
    },
  },
});

interface TempGame {
  id: string
  resourcesDate?: number
  resourceManageDate?: number
  releases: Release[]
  discussions: Discussion[]
}

interface TempData {
  online: boolean
  gamesDate?: number
  games: TempGame[]
}

function init(): TempData {
  return {
    online: true,
    gamesDate: undefined,
    games: []
  };
}
