import asyncHandler from "express-async-handler";
import { getApprovalListAsync } from "../services/adminService.js";

// @desc upload new single file
// route GET /api/admin/approvalList
// @access Private
export const getApprovalList = asyncHandler(async (req, res) => {
  return res.status(200).json(await getApprovalListAsync());
});
