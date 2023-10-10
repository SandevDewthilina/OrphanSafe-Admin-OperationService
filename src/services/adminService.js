import DatabaseHandler from "../lib/database/DatabaseHandler.js";
import { createChannel, publishMessage } from "../lib/rabbitmq/index.js";
import { NOTIFICATION_SERVICE_BINDING_KEY } from "../config/index.js";

export const getApprovalListAsync = async () => {
  const childProfilesToSocialWorkerList =
    await DatabaseHandler.executeSingleQueryAsync(
      `select 
      cpr1."Id" as RequestId,
      u1."Name" as SocialWorkerName, 
      cp1."FullName" as ChildName,
      cp1."Id" as ChildId,
      cpr1."Remark",
      al1."Id" as ApprovalId
      from "ChildProfileRequest" as cpr1
      inner join "ApprovalLog" as al1 on cpr1."ApprovalId" = al1."Id"
      inner join "User" as u1 on u1."Id" = al1."CreatedBy"
      inner join "ChildProfile" as cp1 on cp1."Id" = cpr1."ChildProfileId"
      inner join "SocialWorker" as sw1 on u1."Id" = sw1."UserId"
      WHERE al1."State" = 'CREATED'
      AND al1."CreatedAt" >= CURRENT_DATE - INTERVAL '30 days';`,
      []
    );

  const childCasesToParentList = await DatabaseHandler.executeSingleQueryAsync(
    `select 
    cpr1."Id" as RequestId,
    u1."Name" as ParentName, 
    cp1."FullName" as ChildName,
    cp1."Id" as ChildId,
    cpr1."Remark",
    al1."Id" as ApprovalId
    from "ChildCasesRequestForParent" as cpr1
    inner join "ApprovalLog" as al1 on cpr1."ApprovalId" = al1."Id"
    inner join "User" as u1 on u1."Id" = al1."CreatedBy"
    inner join "ChildProfile" as cp1 on cp1."Id" = cpr1."ChildProfileId"
    inner join "Parent" as p1 on u1."Id" = p1."UserId"
    WHERE al1."State" = 'CREATED' 
    AND al1."CreatedAt" >= CURRENT_DATE - INTERVAL '30 days';`,
    []
  );

  const fundingApprovals = await DatabaseHandler.executeSingleQueryAsync(
    `select f."Id", f."Name", f."TransactionDateTime", f."TransactionAmount",
    f."Description",al."Id" as ApprovalId from "Funding" as f
    inner join "ApprovalLog" as al on al."Id" = f."ApprovalLogId"
    where al."State" = 'CREATED'
    AND al."CreatedAt" >= CURRENT_DATE - INTERVAL '30 days';`,
    []
  );

  return {
    socialWorkerProfileRequests: childProfilesToSocialWorkerList,
    parentCaseRequests: childCasesToParentList,
    fundingApprovals: fundingApprovals,
  };
};

export const approveAsync = async (approvalId, userId) => {
  const resp = await DatabaseHandler.executeSingleQueryAsync(
    `update "ApprovalLog" set "State" = 'ACCEPT', "ReviewedBy" = $2
     where "Id" = $1 RETURNING *;`,
    [approvalId, userId]
  );
  return resp[0];
};

export const rejectAsync = async (approvalId, userId) => {
  const resp = await DatabaseHandler.executeSingleQueryAsync(
    `update "ApprovalLog" set "State" = 'REJECT', "ReviewedBy" = $2
     where "Id" = $1 RETURNING *;`,
    [approvalId, userId]
  );
  return resp[0];
};

export const sendMessageAsync = async ({ from, to, content }) => {
  const resp = await DatabaseHandler.executeSingleQueryAsync(
    `INSERT INTO "Chat"("From", "To", "Content") values($1, $2, $3) RETURNING *`,
    [from, to, content]
  );
  publishMessage(
    await createChannel(),
    NOTIFICATION_SERVICE_BINDING_KEY,
    JSON.stringify({
      event: "UNICAST",
      data: {
        userId: from,
        notification: {
          title: `You have a new message from ${from}`,
          body: content,
        },
      },
    })
  );
  return resp[0];
};

export const loadChatAsync = async ({ userId }) => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `select * from "Chat" where "From" = $1 
     or "To" = $1 order by "Timestamp" LIMIT 100`,
    [userId]
  );
};

export const getReportDataAsync = async ({ query, userInfo }) => {
  const orphanageId = userInfo.orphanageId;
  switch (query.report) {
    case "CHILD_PROFILES_FOR_ORPHANAGE":
      return await DatabaseHandler.executeSingleQueryAsync(
        `select p."Id", p."FullName", p."DOB", p."Gender", p."MedicalDesc", o."Name",
        p."DateOfAdmission", p."GuardianInfo"
        from "ChildProfile" as p
        inner join "Orphanage" as o on o."Id" = p."OrphanageId"
        where p."OrphanageId" = $1`,
        [orphanageId]
      );
    case "ORPHANAGE_CASHFLOW_REPORT":
      return await DatabaseHandler.executeSingleQueryAsync(
        `select f."Id", f."Name", f."Description", f."TransactionAmount", f."TransactionDateTime" 
        from "Funding" as f
        inner join "ApprovalLog" as al on al."Id" = f."ApprovalLogId"
        inner join "User" as u on u."Id" = al."CreatedBy"
        inner join "Orphanage" as o on o."Id" = u."OrphanageId"
        where "TransactionDateTime" between $2 and $3
        and o."Id" = $1
        order by f."TransactionDateTime";`,
        [orphanageId, query.start, query.end]
      );
    default:
      return null;
  }
};
