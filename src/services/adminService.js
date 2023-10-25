import DatabaseHandler from "../lib/database/DatabaseHandler.js";
import { createChannel, publishMessage } from "../lib/rabbitmq/index.js";
import { NOTIFICATION_SERVICE_BINDING_KEY } from "../config/index.js";

export const getApprovalListAsync = async () => {
  const childProfilesToParentList =
    await DatabaseHandler.executeSingleQueryAsync(
      `select 
      cpr1."Id" as RequestId,
      u1."Name" as ParentName, 
      cp1."FullName" as ChildName,
      cp1."Id" as ChildId,
      cpr1."Remark",
      al1."Id" as ApprovalId
      from "ChildProfileRequest" as cpr1
      inner join "ApprovalLog" as al1 on cpr1."ApprovalId" = al1."Id"
      inner join "User" as u1 on u1."Id" = al1."CreatedBy"
      inner join "ChildProfile" as cp1 on cp1."Id" = cpr1."ChildProfileId"
      inner join "Parent" as sw1 on u1."Id" = sw1."UserId"
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
    socialWorkerProfileRequests: childProfilesToParentList,
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

export const loadChatAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `select * from "Chat" order by "Timestamp" LIMIT 100`,
    []
  );
};

export const childProfilesAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT COUNT("Id") FROM "ChildProfile"`,
    []
  );
};
export const workingStaffAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT
      COUNT(ur."UserId")
    FROM "UserRole" AS ur
    INNER JOIN "Role" AS r ON r."Id" = ur."RoleId"
    WHERE ur."RoleId" = (SELECT "Id" FROM "Role" WHERE "Name" = 'orphanageManager')
        OR ur."RoleId"=(SELECT "Id" FROM "Role" WHERE "Name"='orphanageStaff')`,
    []
  );
};
export const orphanagesAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT COUNT("Id") FROM "Orphanage"`,
    []
  );
};
export const socialWorkersAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT
      COUNT(ur."UserId")
    FROM "UserRole" AS ur
    INNER JOIN "Role" AS r ON r."Id" = ur."RoleId"
    WHERE ur."RoleId" = (SELECT "Id" FROM "Role" WHERE "Name" = 'socialWorker')
    `,
    []
  );
};

export const inquiriesAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT "Id","Subject","Description" FROM "Inquiries" LIMIT 10
    `,
    []
  );
};

export const parentRequestAsync = async () => {
  return await DatabaseHandler.executeSingleQueryAsync(
    `SELECT
      p."NameOfMother",
      p."AdoptionPreference" AS "Description",
      p."NameOfFather"
    FROM "User" AS u
    INNER JOIN "UserRole" AS ur ON u."Id" = ur."UserId"
    INNER JOIN "Parent" AS p ON p."UserId" = u."Id"
    WHERE ur."RoleId" = (SELECT "Id" FROM "Role" WHERE "Name" = 'parent') LIMIT 10
    `,
    []
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

export const matchParentsAndChildren = async (parentId) => {
  const parent = await DatabaseHandler.executeSingleQueryAsync(
    `select * from "Parent" where "Id" = $1`,
    [parentId]
  );

  const range = parent[0].AgePreference;

  const match = range.match(/[\[,\(](\d+),(\d+)[\)|\]]/);
  const lowerValue = parseInt(match[1]);
  const upperValue = parseInt(match[2]);

  console.log([
    parent[0].GenderPreference,
    parent[0].LanguagePreference,
    parent[0].NationalityPreference,
    lowerValue,
    upperValue
  ])

  const childProfiles = await DatabaseHandler.executeSingleQueryAsync(
    `select * from "ChildProfile" 
    where "Gender" = $1
    and "Language" = $2
    and "Nationality" = $3
    and EXTRACT(YEAR FROM(AGE("DOB"))) >= $4 and EXTRACT(YEAR FROM(AGE("DOB"))) <= $5`,
    [
      parent[0].GenderPreference,
      parent[0].LanguagePreference,
      parent[0].NationalityPreference,
      lowerValue,
      upperValue
    ]
  );

  await DatabaseHandler.executeSingleQueryAsync(
    `DELETE FROM "ParentChildMatchMapping" WHERE "ParentId" = $1`,
    [parentId]
  )
  childProfiles.forEach(async (profile) => {
    await DatabaseHandler.executeSingleQueryAsync(
      `INSERT INTO "ParentChildMatchMapping" VALUES($1, $2)`,
      [parentId, profile.Id]
    )
  });
};



export const BulkResponseAsync = async (user_email,subject,description) => {
  publishMessage(await createChannel(), NOTIFICATION_SERVICE_BINDING_KEY, {
    event: "SEND_EMAIL",
    data: {
      receiverEmail: user_email,
      subject: "Inquiry response",
      emailContent: {
        body: {
          name: user_name,
          intro: subject,
          action: {
            instructions:
            description,
            
          },
          outro:
            "If you did not request a email verification, no further action is required on your part.",
        },
      },
    },
  });
};
