import express from "express";
import {
  getApprovalList
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/s3UploadMiddleware.js";

const router = express.Router();

router.route("/listFilesInPath").get(protect, getApprovalList)

export default router;
