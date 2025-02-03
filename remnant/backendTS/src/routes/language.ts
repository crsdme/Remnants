import { Router } from "express";
import * as LanguageController from "../controllers/language";
// import { validateGetLanguage } from "../middleware/validation/";

const router = Router();

router.get("/get", LanguageController.get);
router.post("/create", LanguageController.create);
router.post("/edit", LanguageController.edit);
router.post("/remove", LanguageController.remove);

export default router;
