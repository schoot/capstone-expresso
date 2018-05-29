const apiRouter = require('express').Router();
module.exports = apiRouter;

const employeesRouter = require('./employeesRouter');
const menusRouter = require('./menusRouter');
apiRouter.use('/menus', menusRouter);
apiRouter.use('/employees', employeesRouter);