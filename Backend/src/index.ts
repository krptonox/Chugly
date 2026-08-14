// @ts-ignore
import express, { Request, Response } from "express";

const app = express();

const PORT: number = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Chugly Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});