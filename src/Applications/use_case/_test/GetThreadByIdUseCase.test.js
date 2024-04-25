const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadUseCase = require('../GetThreadByIdUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
    };
    const expectedThread = {
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        content: 'comment content',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        is_deleted: false,
      },
    ];
    const expectedComments = [
      {
        id: 'comment-123',
        content: 'comment content',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        is_deleted: false,
      },
    ];

    const mockLikesCount = [
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-124',
      },
    ];

    const expectedLikesCount = [
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
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
    const mappedLikesCount = expectedLikesCount.map(({ comment_id }) => ({ comment_id }));

    const expectedCommentsAndReplies = [
      {
        ...mappedComments[0],
        likeCount: mappedLikesCount.length,
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockLikeRepository.getCommentsLikesCount = jest.fn()
      .mockImplementation(() => Promise.resolve(mockLikesCount));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const mockGetThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      replyRepository: mockReplyRepository,
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
    expect(mockLikeRepository.getCommentsLikesCount).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });

  it('should not display deleted comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
    };
    const expectedThread = {
      id: 'thread-123',
      title: 'tread title',
      body: 'thread body',
      date: '2024-08-04T07:58:35.000Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        content: 'comment content',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        is_deleted: true,
      },
    ];
    const expectedComments = [
      {
        id: 'comment-123',
        content: '**komentar telah dihapus**',
        username: 'dicoding',
        date: '2024-08-04T08:58:35.000Z',
        is_deleted: true,
      },
    ];

    const mockLikesCount = [
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-124',
      },
    ];

    const expectedLikesCount = [
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
      },
      {
        comment_id: 'comment-123',
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
    const mappedLikesCount = expectedLikesCount.map(({ comment_id }) => ({ comment_id }));

    const expectedCommentsAndReplies = [
      {
        ...mappedComments[0],
        likeCount: mappedLikesCount.length,
        replies: mappedReplies,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockLikeRepository.getCommentsLikesCount = jest.fn()
      .mockImplementation(() => Promise.resolve(mockLikesCount));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const mockGetThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
      replyRepository: mockReplyRepository,
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
    expect(mockLikeRepository.getCommentsLikesCount).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
