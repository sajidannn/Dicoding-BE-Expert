const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.verifyAvailableThread(newReply.threadId);
    await this._commentRepository.verifyAvailableCommentInThread(newReply.commentId, newReply.threadId);
    const addedReply = await this._replyRepository.addReply(newReply);
    return new AddedReply(addedReply);
  }
}

module.exports = AddReplyUseCase;
