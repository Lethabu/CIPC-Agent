import app from "./app.js";
import bo from "./src/routes/bo.js";
import authRoutes from "./routes/auth.js";

app.use("/api/bo", bo);
app.use("/api/auth", authRoutes);

app.listen(process.env.API_PORT || 3000, () => console.log("API up"));