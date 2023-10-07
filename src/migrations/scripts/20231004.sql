CREATE TYPE datarequesttype AS ENUM ('CHILDINFOTOPARENT', 'CHILDINFOTOSOCIALWORKER');

create table "DataRequest" (
	"Id" uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	"RecieverId" uuid NOT NULL,
	"ApprovalId" int NOT NULL,
	"Remark" varchar(225) NOT NULL,
	"RequestData" varchar(2000) NOT NULL,
	"RequestType" datarequesttype NOT NULL,
	FOREIGN KEY ("RecieverId") REFERENCES "User"("Id"),
	FOREIGN KEY ("ApprovalId") REFERENCES "ApprovalLog"("Id")
)