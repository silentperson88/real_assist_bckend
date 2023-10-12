const baseRoute = '/api';

module.exports = app => {
  app.use(`${baseRoute}/export`, require('./export.route'));
};
