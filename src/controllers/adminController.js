import asyncHandler from "express-async-handler";
import {
  getApprovalListAsync,
  approveAsync,
  rejectAsync,
  sendMessageAsync,
  loadChatAsync,
  getReportDataAsync
} from "../services/adminService.js";

// @desc upload new single file
// route GET /api/admin/approvalList
// @access Private
export const getApprovalList = asyncHandler(async (req, res) => {
  return res.status(200).json(await getApprovalListAsync());
});

// @desc upload new single file
// route GET /api/admin/approvalList
// @access Private
export const approveApproval = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(await approveAsync(req.body.approvalId, req.userInfo.userId));
});

// @desc upload new single file
// route GET /api/admin/approvalList
// @access Private
export const rejectApproval = asyncHandler(async (req, res) => {
  return res.status(200).json(await rejectAsync(req.body.approvalId));
});

// @desc send message
// route POST /api/admin/chat
// @access Private
export const sendMessage = asyncHandler(async (req, res) => {
  return res.status(200).json(await sendMessageAsync(req.body));
});

// @desc load messages
// route GET /api/admin/chat
// @access Private
export const loadChat = asyncHandler(async (req, res) => {
  return res.status(200).json(await loadChatAsync(req.userInfo));
});

// @desc load report data
// route GET /api/admin/report
// @access Private
export const getReportData = asyncHandler(async (req, res) => {
  return res.status(200).json(await getReportDataAsync(req));
});
