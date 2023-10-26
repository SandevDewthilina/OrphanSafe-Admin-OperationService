import asyncHandler from "express-async-handler";
import {
  getApprovalListAsync,
  approveAsync,
  rejectAsync,
  sendMessageAsync,
  loadChatAsync,
  getReportDataAsync,
  childProfilesAsync,
  workingStaffAsync,
  orphanagesAsync,
  socialWorkersAsync,
  parentRequestAsync,
  inquiriesAsync,
  BulkResponseAsync
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
  return res.status(200).json(await loadChatAsync());
});

// @desc load report data
// route GET /api/admin/report
// @access Private
export const getReportData = asyncHandler(async (req, res) => {
  return res.status(200).json(await getReportDataAsync(req));
});

export const adminDashboard = asyncHandler(async (req, res) => {
  const childProfiles = await childProfilesAsync();
  const workingStaff = await workingStaffAsync();
  const socialWorkers = await socialWorkersAsync();
  const orphanages = await orphanagesAsync();
  const parent = await parentRequestAsync()
  const inquiries = await inquiriesAsync();
  return res.status(200).json({
    success: true,
    childProfiles: childProfiles[0].count,
    workingStaff: workingStaff[0].count,
    socialWorkers: socialWorkers[0].count,
    orphanages: orphanages[0].count,
    parents: parent,
    inquiries:inquiries
  });
});



export const BulkResponse = asyncHandler(async (req, res) => {
  const{description,Emails,subject}= req.body
  return res.status(200).json(await BulkResponseAsync(Emails,subject,description));
});
