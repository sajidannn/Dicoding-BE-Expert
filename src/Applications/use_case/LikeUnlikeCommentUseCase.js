class LikeUnlikeCommentUseCase {
  constructor({ commentRepository, threadRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.threadId);
    await this._commentRepository.verifyAvailableCommentInThread(useCasePayload.commentId, useCasePayload.threadId);

    const isLikeExist = await this._likeRepository.isLikeExist(useCasePayload);

    if (isLikeExist > 0) {
      return this._likeRepository.unlikeComment(useCasePayload);
    }

    return this._likeRepository.likeComment(useCasePayload);
  }
}

module.exports = LikeUnlikeCommentUseCase;
