const { Router } = require("express");
const UserService = require("../services/user");

const genericRouter = require("./generic");
const genericController = require("../controllers/generic");

const router = new Router();

router.use("/", new genericRouter(new genericController(new UserService())));

module.exports = router;