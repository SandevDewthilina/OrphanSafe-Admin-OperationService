import express from "express";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import { runMigrations } from "./migrations/index.js";
import { RPCObserver, createChannel, subscribeMessage } from "./lib/rabbitmq/index.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { PORT, DOCUMENT_SERVICE_RPC, ADMIN_SERVICE_BINDING_KEY } from "./config/index.js";
import { matchParentsAndChildren } from "./services/adminService.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// runMigrations()

// RPCObserver
// RPCObserver(DOCUMENT_SERVICE_RPC);
subscribeMessage(await createChannel(), ADMIN_SERVICE_BINDING_KEY)

// routes
app.use("/api/admin", adminRoutes);
app.get("/api", (req, res) => res.status(200).json("admin service is listening"));
//error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`service is listening on port ${PORT}`));
