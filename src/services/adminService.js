import DatabaseHandler from "../lib/database/DatabaseHandler.js";
import {
  uploadSingleFileAsync as uploadSingleFileToS3,
  getSignedUrlForKeysAsync as getSignedUrlForKeysAsyncS3,
  deleteFilesForKeysAsync as deleteFilesForKeysAsyncS3,
  listFilesInPathAsync as listFilesInPathAsyncS3
} from "../lib/aws/index.js";

export const listFilesInPathAsync = async (path) => {
  return await listFilesInPathAsyncS3(path);
}

export const uploadSingleFileAsync = async (path, file) => {
  return await uploadSingleFileToS3(path, file);
};

export const getSignedUrlForKeysAsync = async (keys) => {
  return await getSignedUrlForKeysAsyncS3(keys);
};

export const deleteFilesForKeysAsync = async (keys) => {
  await deleteFilesForKeysAsyncS3(keys);
};
