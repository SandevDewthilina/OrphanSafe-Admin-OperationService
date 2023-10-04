import asyncHandler from "express-async-handler";
import {
  uploadSingleFileAsync,
  getSignedUrlForKeysAsync,
  deleteFilesForKeysAsync,
  listFilesInPathAsync,
} from "../services/adminService.js";

// @desc upload new single file
// route POST /api/documents/uploadSingleFile
// @access Private
export const listFilesInPath = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(await listFilesInPathAsync(req.query.path));
});

// @desc upload new single file
// route POST /api/documents/uploadSingleFile
// @access Private
export const uploadSingleFile = asyncHandler(async (req, res) => {
  const key = await uploadSingleFileAsync(req.body.path, req.file);
  return res.status(200).json({
    generatedKey: key,
  });
});

// @desc get urls for file keys
// route POST /api/documents/getUrlsForKeys
// @access Private
export const getUrlsForKeys = asyncHandler(async (req, res) => {
  return res.status(200).json(await getSignedUrlForKeysAsync(req.body.keys));
});

// @desc delete files for keys
// route POST /api/documents/getUrdeleteFilesForKeys
// @access Private
export const deleteFilesForKeys = asyncHandler(async (req, res) => {
  await deleteFilesForKeysAsync(req.body.keys);
  return res.status(200).json("delete request sent successfully");
});
