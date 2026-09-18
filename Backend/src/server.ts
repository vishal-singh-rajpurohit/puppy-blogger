import { conn } from "./db/conn.js";
import { server } from "./app.js"

conn()
    .then(() => {
        console.log('connected to db');

        const port = process.env.PORT;
        server.listen(port, () => {
            console.log(`server is running on: http://localhost:${port}`);
        })
    })
    .catch((_) => {
        process.exit(1)
    });