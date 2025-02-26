import { Router } from "express";
import * as CurrencyController from "../controllers/currency";
import { validateGetCurrencies } from "../middleware/validation/";

const router = Router();

router.get("/get", validateGetCurrencies, CurrencyController.get);
router.post("/create", CurrencyController.create);
router.post("/edit", CurrencyController.edit);
router.post("/remove", CurrencyController.remove);

export default router;
