import { Router } from "express";
import * as AuthController from "../controllers/auth";
import { validateLogin, validateRegister } from "../middleware/validation";

const router = Router();

router.post("/login", validateLogin, AuthController.login);
router.post("/register", validateRegister, AuthController.register);

export default router;
