const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('LikeUnlikeCommentUseCase', () => {
  it('should orchestrating the like comment use case correctly', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.isLikeExist = jest.fn()
      .mockImplementation(() => Promise.resolve(0));
    mockLikeRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve(1));

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const isLike = await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(isLike).toEqual(1);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockLikeRepository.isLikeExist).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.likeComment).toBeCalledWith(useCasePayload);
  });

  it('should orchestrating the unlike comment use case correctly', async () => {
    // Arrange
    const useCasePayload = {
      userId: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.isLikeExist = jest.fn()
      .mockImplementation(() => Promise.resolve(1));
    mockLikeRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve(1));

    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const isUnlike = await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(isUnlike).toEqual(1);
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyAvailableCommentInThread).toBeCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(mockLikeRepository.isLikeExist).toBeCalledWith(useCasePayload);
    expect(mockLikeRepository.unlikeComment).toBeCalledWith(useCasePayload);
  });
});
