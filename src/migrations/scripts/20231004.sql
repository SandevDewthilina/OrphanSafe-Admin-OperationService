alter table "ApprovalLog" add column "CreatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
alter table "Funding" add column "Description" varchar(255) NOT NULL;
create table "ChildProfileRequest" (
	"Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"ApprovalId" int NOT NULL,
	"ChildProfileId" uuid NOT NULL,
	"Remark" varchar(225) NOT NULL,
	FOREIGN KEY ("ChildProfileId") REFERENCES "ChildProfile"("Id"),
	FOREIGN KEY ("ApprovalId") REFERENCES "ApprovalLog"("Id")
)

create table "ChildCasesRequestForParent" (
	"Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"ApprovalId" int NOT NULL,
	"ChildProfileId" uuid NOT NULL,
	"Remark" varchar(225) NOT NULL,
	FOREIGN KEY ("ChildProfileId") REFERENCES "ChildProfile"("Id"),
	FOREIGN KEY ("ApprovalId") REFERENCES "ApprovalLog"("Id")
)

create table "Chat" (
	"Id" SERIAL PRIMARY KEY,
	"From" uuid NOT NULL,
	"To" uuid NOT NULL,
	"Timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"Content" varchar(255) NOT NULL,
	FOREIGN KEY ("From") REFERENCES "User"("Id")
	FOREIGN KEY ("To") REFERENCES "User"("Id")
)

CREATE INDEX idx_messages_from
ON "Chat" ("From");

CREATE INDEX idx_messages_to
ON "Chat" ("To");

CREATE INDEX idx_messages_id
ON "Chat" ("Id");