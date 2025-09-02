import app from "./app";
import bo from "./routes/bo";
import authRoutes from "./routes/auth";

app.use("/api/bo", bo);
app.use("/api/auth", authRoutes);

app.listen(process.env.API_PORT || 3000, () => console.log("API up"));