const LikeUnlikeCommentUseCase = require('../../../../Applications/use_case/LikeUnlikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request) {
    const likeUnlikeUseCase = this._container.getInstance(LikeUnlikeCommentUseCase.name);
    await likeUnlikeUseCase.execute({
      threadId: request.params.threadId,
      commentId: request.params.commentId,
      userId: request.auth.credentials.id,
    });

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
