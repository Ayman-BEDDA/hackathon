const { Router } = require("express");
const UserService = require("../services/user");

const router = Router();

const SecurityController = require("../controllers/security")(
  new UserService()
);

router.post("/login", SecurityController.login);
router.post("/register", SecurityController.register);
router.post("/logout", SecurityController.logout);

module.exports = router;
