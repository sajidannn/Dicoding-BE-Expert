const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('end point add comment', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when request is not authenticated', async () => {
      // arrange
      const requestPayload = {
        content: 'content of comment',
      };
      const server = await createServer(container);

      /* add user and thread */
      const userId = await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // arrange
      const requestPayload = {
        content: 'content of comment',
      };
      const server = await createServer(container);

      /* login and get acces token */
      const { userId, accessToken } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      await ThreadsTableTestHelper.addThread({ owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/notFoundThread/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // arrange
      const requestPayload = {
        content: '',
      };
      const server = await createServer(container);

      /* login to add thread and get accessToken and threadId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 201 and persisted comment', async () => {
      // arrange
      const requestPayload = {
        content: 'content of comment',
      };
      const server = await createServer(container);

      /* login to add thread and get accessToken and threadId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when request not contain access token', async () => {
      // arrange
      const server = await createServer(container);

      /* add user, thread, adn comment */
      const { userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // arrange
      const server = await createServer(container);

      /* login to add thread and get accessToken and threadId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/notFoundThread/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan pada thread ini');
    });

    it('should response 403 when user is not owner', async () => {
      // arrange
      const server = await createServer(container);

      /* login to add thread and get accessToken and threadId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      /* added comment user */
      const userId2 = 'user-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await UsersTableTestHelper.addUser({ id: userId2 });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId2 });

      // action
      /* delete comment with user that not owned */
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda bukan pemilik komentar ini');
    });

    it('should response 200 and delete comment', async () => {
      // arrange
      const server = await createServer(container);

      /* login to add thread and get accessToken and threadId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
