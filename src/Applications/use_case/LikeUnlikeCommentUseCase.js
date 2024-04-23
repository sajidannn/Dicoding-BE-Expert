class LikeUnlikeCommentUseCase {
  constructor({ commentRepository, threadRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { userId, threadId, commentId } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyAvailableCommentInThread(commentId, threadId);

    const isLikeExist = await this._likeRepository.isLikeExist(userId, commentId);

    if (isLikeExist > 0) {
      return this._likeRepository.unlikeComment(userId, commentId);
    }

    return this._likeRepository.likeComment(userId, commentId);
  }
}

module.exports = LikeUnlikeCommentUseCase;
