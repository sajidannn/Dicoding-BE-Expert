/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'content',
    owner = 'user-123',
    threadId = 'thread-123',
    date = '2021-08-08',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5)',
      values: [id, content, owner, threadId, date],
    };

    await pool.query(query);
  },

  async getCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const { rows } = await pool.query(query);
    return rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentTableTestHelper;
