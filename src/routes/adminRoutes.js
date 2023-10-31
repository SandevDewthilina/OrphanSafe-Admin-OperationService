import express from "express";
import {
  getApprovalList,
  approveApproval,
  rejectApproval,
  sendMessage,
  loadChat,
  getReportData,
  adminDashboard,
  BulkResponse
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/s3UploadMiddleware.js";

const router = express.Router();

router.route("/approvalList").get(protect, getApprovalList);
router.route("/approve").put(protect, approveApproval);
router.route("/reject").put(protect, rejectApproval);

router.route("/chat").post(protect, sendMessage).get(protect, loadChat);
router.route("/report").get(protect, getReportData);
router.route("/adminDashboard").get(protect, adminDashboard);
router.route("/BulkResponse").post(protect, BulkResponse);
export default router;
