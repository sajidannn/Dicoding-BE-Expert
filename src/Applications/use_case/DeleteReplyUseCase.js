class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      replyId,
      commentId,
      threadId,
      owner,
    } = useCasePayload;

    await this._replyRepository.verifyAvailableReply(replyId, commentId, threadId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
