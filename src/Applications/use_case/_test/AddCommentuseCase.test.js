const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment usecase correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      date: '2024-08-08T07:22:33.555Z',
      content: useCasePayload.content,
    });

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      owner: useCasePayload.owner,
      threadId: useCasePayload.threadId,
      date: '2024-08-08T07:22:33.555Z',
      content: useCasePayload.content,
    });

    // creating usecase dependencys
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // mocking needed function
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new NewComment({
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
        content: useCasePayload.content,
      }),
    );
  });
});
