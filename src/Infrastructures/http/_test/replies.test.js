const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('end point add reply', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request is not authenticated', async () => {
      // arrange
      const requestPayload = {
        content: 'content of reply',
      };

      const server = await createServer(container);

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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
        content: 'content of reply',
      };

      const server = await createServer(container);

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'fakeThread';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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

    it('should response 404 when comment not found', async () => {
      // arrange
      const requestPayload = {
        content: 'content of reply',
      };

      const server = await createServer(container);

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'fakeComment';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
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

    it('should response 400 when request payload not contain needed property', async () => {
      // arrange
      const requestPayload = {
        content: '',
      };

      const server = await createServer(container);

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // arrange
      const requestPayload = {
        content: 123,
      };

      const server = await createServer(container);
      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted reply', async () => {
      // arrange
      const server = await createServer(container);

      /* add reply payload */
      const requestPayload = {
        content: 'content of reply',
      };

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });

      // action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
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
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.id).toBeDefined();
      expect(responseJson.data.addedReply.content).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when request is not authenticated', async () => {
      // arrange
      const server = await createServer(container);
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'fakeThread';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: userId,
        commentId: 'comment-123',
      });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // arrange
      const server = await createServer(container);

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'fakeComment';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: userId,
        commentId: 'comment-123',
      });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      // arrange
      const server = await createServer(container);

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'fakeReply';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: userId,
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: userId,
        commentId: 'comment-123',
      });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 401 when user not owner', async () => {
      // arrange
      const server = await createServer(container);

      /* login and add thread to get accessToken and threadId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      /* added comment user */
      const userId2 = 'user-345';

      await UsersTableTestHelper.addUser({ id: userId2 });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner: userId2,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId2,
        commentId: 'comment-123',
      });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda bukan pemilik balasan ini');
    });

    it('should response 200 when delete reply', async () => {
      // arrange
      const server = await createServer(container);

      /* login to get accessToken and userId */
      const { accessToken, userId } = await ServerTestHelper.getAccessTokenAndUserId({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        owner: userId,
        threadId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        owner: userId,
        commentId,
      });

      // action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
