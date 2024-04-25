const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('isLikeExist function', () => {
    it('should check if comment is liked or not', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLikeExist = await likeRepositoryPostgres.isLikeExist(payload);

      // Assert
      expect(isLikeExist).toEqual(1);
    });

    it('should return false if comment is not liked', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLikeExist = await likeRepositoryPostgres.isLikeExist(payload);

      // Assert
      expect(isLikeExist).toEqual(0);
    });
  });

  describe('likeComment function', () => {
    it('should persist like and return added like correctly', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };
      const fakeIdGenerator = () => 'like-123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const likes = await likeRepositoryPostgres.likeComment(payload);

      // Assert
      expect(likes).toEqual(1);
    });
  });

  describe('unlikeComment function', () => {
    it('should persist unlike and return removed like correctly', async () => {
      // Arrange
      const payload = {
        userId: 'user-123',
        commentId: 'comment-123',
      };
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const unlike = await likeRepositoryPostgres.unlikeComment(payload);

      // Assert
      expect(unlike).toEqual(1);
    });
  });

  describe('getCommentsLikesCount function', () => {
    it('should return comments likes count correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-124', username: 'Alok' });
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-124', commentId: 'comment-123', userId: 'user-124' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const commentsLikesCount = await likeRepositoryPostgres.getCommentsLikesCount('thread-123');

      // Assert
      expect(commentsLikesCount).toStrictEqual([
        {
          comment_id: 'comment-123',
        },
        {
          comment_id: 'comment-123',
        },
      ]);
    });
  });
});
