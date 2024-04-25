class LikeRepository {
  async isLikeExist(userId, commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED_HERE');
  }

  async likeComment(userId, commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED_HERE');
  }

  async unlikeComment(userId, commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED_HERE');
  }

  async getCommentsLikesCount(threadId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED_HERE');
  }
}

module.exports = LikeRepository;
