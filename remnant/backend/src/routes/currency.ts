import { Router } from "express";
import * as CurrencyController from "../controllers/currency";
import {
  validateGetCurrencies,
  validateCreateCurrency,
  validateEditCurrency,
  validateRemoveCurrency,
  validateBatchCurrency,
  validateImportCurrencies,
} from "../middleware/validation/";
import { uploadSingle } from "../middleware/upload.middleware";

const router = Router();

router.get("/get", validateGetCurrencies, CurrencyController.get);
router.post("/create", validateCreateCurrency, CurrencyController.create);
router.post("/edit", validateEditCurrency, CurrencyController.edit);
router.post("/remove", validateRemoveCurrency, CurrencyController.remove);
router.post("/batch", validateBatchCurrency, CurrencyController.batch);
router.post(
  "/import",
  uploadSingle("file"),
  CurrencyController.importCurrencies
);

export default router;
