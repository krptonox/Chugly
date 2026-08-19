import { createServer } from "node:http";

import app from "./app.js";
import connectDB from "./db/indexDB.js";
import { createRealtimeServer } from "./realtime/realtime.server.js";

const PORT = 3000;

connectDB()
.then(() => {
    const httpServer = createServer(app);

    createRealtimeServer(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
});