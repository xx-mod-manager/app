import { defineStore } from 'pinia';
import { ApiComment } from 'src/class/GraphqlClass';
import { Comment, Discussion, Game, Release } from 'src/class/Types';
import { deleteArrayItemByFieldId, deleteArrayItemsByFileId, findArrayItemByFieldId, findArrayItemById } from 'src/utils/ArrayUtils';

const KEY_ONLINE_DATA = 'onlineData';
const REFRESH_TIME = 1000 * 60 * 10;

export const useOnlineDataStore = defineStore(KEY_ONLINE_DATA, {
  state: init,

  getters: {},

  actions: {
    getOptionOnlineGameById(id: string): OnlineGame | undefined {
      return findArrayItemById(this.games, id);
    },

    getOnlineGameById(id: string): OnlineGame {
      const game = this.getOptionOnlineGameById(id);
      if (game == undefined) throw Error(`Miss game [${id}]`);
      return game;
    },

    getOptionReleaseById(gameId: string, releaseId: string): Release | undefined {
      return findArrayItemById(this.getOptionOnlineGameById(gameId)?.releases, releaseId);
    },

    getOptionDiscussionById(gameId: string, discussionId: string): Discussion | undefined {
      return findArrayItemById(this.getOptionOnlineGameById(gameId)?.discussions, discussionId);
    },

    getDiscussionById(gameId: string, discussionId: string): Discussion {
      const discussion = findArrayItemById(this.getOnlineGameById(gameId).discussions, discussionId);
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
      if (this.gamesDate == undefined) return true;
      return this.gamesDate + REFRESH_TIME < Date.now();
    },

    needRefreshResources(gameId: string): boolean {
      const onlineGame = this.getOnlineGameById(gameId);
      if (onlineGame.resourcesDate == undefined) return true;
      return onlineGame.resourcesDate + REFRESH_TIME < Date.now();
    },

    needRefreshResourceManage(gameId: string): boolean {
      const onlineGame = this.getOnlineGameById(gameId);
      return onlineGame.resourceManageDate == undefined;
    },

    updateOnlineGames(onlineGames: Game[]) {
      this.gamesDate = Date.now();
      const deletedGames: OnlineGame[] = [...this.games];
      onlineGames.forEach((onlineGame) => {
        const oldOnlineGame = this.getOptionOnlineGameById(onlineGame.id);
        if (oldOnlineGame != undefined) {
          deleteArrayItemByFieldId(deletedGames, oldOnlineGame);
        } else {
          this.games.push({ id: onlineGame.id, releases: [], discussions: [] });
        }
      });
      deleteArrayItemsByFileId(this.games, deletedGames);
    },

    updateResources(gameId: string) {
      const onlineGame = this.getOnlineGameById(gameId);
      onlineGame.resourcesDate = Date.now();
    },

    updateResourceManage(gameId: string) {
      const onlineGame = this.getOnlineGameById(gameId);
      onlineGame.resourceManageDate = Date.now();
    },

    addRelease(gameId: string, onlineRelease: Release) {
      const game = this.getOnlineGameById(gameId);
      const oldRelease = findArrayItemByFieldId(game.releases, onlineRelease);
      if (oldRelease != undefined) {
        deleteArrayItemByFieldId(game.releases, oldRelease);
      }
      game.releases.push(onlineRelease);
    },

    addDiscussion(gameId: string, onlineDiscussion: Discussion) {
      const game = this.getOnlineGameById(gameId);
      const oldRelease = findArrayItemByFieldId(game.discussions, onlineDiscussion);
      if (oldRelease != undefined) {
        deleteArrayItemByFieldId(game.releases, oldRelease);
      }
      game.discussions.push(onlineDiscussion);
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

interface OnlineGame {
  id: string
  resourcesDate?: number
  resourceManageDate?: number
  releases: Release[]
  discussions: Discussion[]
}

interface OnlineData {
  gamesDate?: number
  games: OnlineGame[]
}

function init(): OnlineData {
  return {
    games: []
  };
}
