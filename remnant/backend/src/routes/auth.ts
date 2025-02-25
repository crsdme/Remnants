import { Router } from "express";
import * as AuthController from "../controllers/auth";
import { validateLogin } from "../middleware/validation";
import { refreshJWT } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", validateLogin, AuthController.login);
router.post("/refresh", refreshJWT, AuthController.refresh);
router.post("/logout", AuthController.logout);
// router.post("/register", validateRegister, AuthController.register);

export default router;
