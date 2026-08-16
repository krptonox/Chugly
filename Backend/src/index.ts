import app from "./app";
import connectDB from './db/indexDB.js';

const PORT = 3000;

connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
})
.catch((error) =>{
    console.log("Error connecting to MongoDB: ", error);
})