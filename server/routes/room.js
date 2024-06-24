const { Router } = require("express");
const RoomService = require("../services/room");

const genericRouter = require("./generic");
const genericController = require("../controllers/generic");

const router = new Router();

router.use("/", new genericRouter(new genericController(new RoomService())));

module.exports = router;