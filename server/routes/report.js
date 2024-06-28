const { Router } = require("express");
const ReportService = require("../services/report");

const genericRouter = require("./generic");
const genericController = require("../controllers/generic");

const router = new Router();

router.use("/", new genericRouter(new genericController(new ReportService())));

module.exports = router;