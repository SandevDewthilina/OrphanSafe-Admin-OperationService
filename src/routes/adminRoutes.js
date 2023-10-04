import express from "express";
import {
  uploadSingleFile,
  getUrlsForKeys,
  deleteFilesForKeys,
  listFilesInPath
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/s3UploadMiddleware.js";

const router = express.Router();

router
  .route("/uploadSingleFile")
  .post(protect, upload.single("file"), uploadSingleFile);
router.route("/getUrlsForKeys").post(protect, getUrlsForKeys);
router.route("/listFilesInPath").get(protect, listFilesInPath)
router.route("/deleteFilesForKeys").delete(protect, deleteFilesForKeys)

export default router;
