const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadByIdUseCase');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('GetThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = new DetailThread({
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
      comments: [],
    });
    const expectedThread = new DetailThread({
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
      comments: [],
    });

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        content: 'comment content',
        is_deleted: false,
      },
    ];
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        content: 'comment content',
        is_deleted: false,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'reply content',
        date: '2024-08-04T09:58:35.000Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_deleted: false,
      },
    ];
    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'reply content',
        date: '2024-08-04T09:58:35.000Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_deleted: false,
      },
    ];

    const mappedComments = expectedComments.map(({ is_deleted: deletedComment, ...otherProperties }) => otherProperties);
    const mappedReplies = expectedReplies.map(({ comment_id, is_deleted, ...otherProperties }) => otherProperties);

    const expectedCommentsAndReplies = [
      {
        ...mappedComments[0],
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const mockGetThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await mockGetThreadUseCase.execute(useCasePayload.threadId);

    // Assert
    expect(thread).toStrictEqual({
      ...expectedThread,
      comments: expectedCommentsAndReplies,
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });

  it('should not display deleted comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = new DetailThread({
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
      comments: [],
    });
    const expectedThread = new DetailThread({
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
      comments: [],
    });

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        content: 'comment content',
        is_deleted: true,
      },
    ];
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        content: '**komentar telah dihapus**',
        is_deleted: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'reply content',
        date: '2024-08-04T09:58:35.000Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_deleted: true,
      },
    ];
    const expectedReplies = [
      {
        id: 'reply-123',
        content: '**balasan telah dihapus**',
        date: '2024-08-04T09:58:35.000Z',
        username: 'dicoding',
        comment_id: 'comment-123',
        is_deleted: true,
      },
    ];

    const mappedComments = expectedComments.map(({ is_deleted: deletedComment, ...otherProperties }) => otherProperties);
    const mappedReplies = expectedReplies.map(({ comment_id, is_deleted, ...otherProperties }) => otherProperties);

    const expectedCommentsAndReplies = [
      {
        ...mappedComments[0],
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const mockGetThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await mockGetThreadUseCase.execute(useCasePayload.threadId);

    // Assert
    expect(thread).toStrictEqual({
      ...expectedThread,
      comments: expectedCommentsAndReplies,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockThreadRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
