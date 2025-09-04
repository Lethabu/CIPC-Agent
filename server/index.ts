import app from "./app.js";
import bo from "./src/routes/bo.js";
import authRoutes from "./routes/auth.js";
import { startComplianceMonitoringWorkflow } from "./services/temporal.js";

app.use("/api/bo", bo);
app.use("/api/auth", authRoutes);

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, async () => {
  console.log(`API server listening on port ${PORT}`);

  // Ensure the eternal compliance monitoring workflow is scheduled
  try {
    await startComplianceMonitoringWorkflow(); // Uses the default daily schedule
  } catch (error) {
    console.error("Failed to start compliance monitoring workflow:", error);
    // Depending on the severity, you might want to exit the process
    // process.exit(1);
  }
});
