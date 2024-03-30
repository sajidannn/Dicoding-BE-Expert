const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const addedComment = await CommentsTableTestHelper.getCommentById('comment-456');
      expect(addedComment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'content',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const fakeIdGenerator = () => '456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-456',
        content: 'content',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyAvailableCommentInThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentInThread('comment-123', 'thread-456'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentInThread('comment-123', 'thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment is found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentInThread('comment-123', 'thread-123'))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return all comments from a thread correctly', async () => {
      const firstComment = {
        id: 'comment-123',
        content: 'first comment',
        date: new Date('2024-05-08T00:00:00.000Z'),
      };
      const secondComment = {
        id: 'comment-345',
        content: 'second comment',
        date: new Date('2024-05-08T01:00:00.000Z'),
      };

      await CommentsTableTestHelper.addComment(firstComment);
      await CommentsTableTestHelper.addComment(secondComment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      let commentDetails = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      commentDetails = commentDetails.map((comment) => ({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
      }));

      expect(commentDetails).toEqual([
        { ...firstComment, username: 'dicoding' },
        { ...secondComment, username: 'dicoding' },
      ]);
    });

    it('should return an empty array when no comments exist for the thread', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const commentDetails = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-123',
      );
      expect(commentDetails).toStrictEqual([]);
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should delete comment by id correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.getCommentById('comment-123');
      expect(comments[0].is_deleted).toEqual(true);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-456'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment owner is the same as the payload', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves
        .not
        .toThrowError(AuthorizationError);
    });
  });
});
