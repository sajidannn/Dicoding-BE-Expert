/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    commentId = 'comment-123',
    userId = 'user-123',
    date = '2024-05-08T07:22:33.555Z',
  }) {
    const query = {
      text: 'INSERT INTO likes_comments VALUES($1, $2, $3, $4)',
      values: [id, commentId, userId, date],
    };

    await pool.query(query);
  },

  async findLike({ commentId, userId }) {
    const query = {
      text: 'SELECT * FROM likes_comments WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes_comments WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
