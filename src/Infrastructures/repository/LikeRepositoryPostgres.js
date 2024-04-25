const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async isLikeExist(payload) {
    const { userId, commentId } = payload;

    const query = {
      text: 'SELECT 1 FROM likes_comments WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount;
  }

  async likeComment(payload) {
    const { userId, commentId } = payload;
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO likes_comments VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount;
  }

  async unlikeComment(payload) {
    const { userId, commentId } = payload;

    const query = {
      text: 'DELETE FROM likes_comments WHERE comment_id = $1 AND owner = $2',
      values: [commentId, userId],
    };

    const { rowCount } = await this._pool.query(query);

    return rowCount;
  }

  async getCommentsLikesCount(threadId) {
    const query = {
      text: 'SELECT comment_id FROM likes_comments WHERE comment_id IN (SELECT id FROM comments WHERE thread_id = $1)',
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = LikeRepositoryPostgres;
