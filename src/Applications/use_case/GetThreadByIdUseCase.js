class GetThreadByIdUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    let comments = await this._commentRepository.getCommentsByThreadId(threadId);
    // const replies = await this._threadRepository.getRepliesByThreadId(threadId);

    comments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted
        ? '**komentar telah dihapus**'
        : comment.content,
    }));

    const result = {
      ...thread,
      comments,
    };

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetThreadByIdUseCase;
