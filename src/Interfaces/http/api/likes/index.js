const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { container }) => {
    const likesHandler = new LikesHandler(container);
    server.route(routes(likesHandler));
  },
};
