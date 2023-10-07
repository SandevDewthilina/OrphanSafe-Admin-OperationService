import DatabaseHandler from "../lib/database/DatabaseHandler.js";

export const getApprovalListAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT * FROM "DataRequest" INNER JOIN "ApprovalLog" ON `
    , []);
}