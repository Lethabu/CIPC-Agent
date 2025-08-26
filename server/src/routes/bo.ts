import { Router } from "express";
import { z } from "zod";

// Define the input schema for Beneficial Ownership data
const In = z.object({
  entityRegNo: z.string().min(1, { message: "Entity registration number is required" }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  idNumber: z.string().min(6, { message: "ID number must be at least 6 characters" }),
  ownershipPct: z.number().min(0).max(100).optional(), // Optional, for percentage of ownership
});

const router = Router();

// Route for BO compliance assistance
router.post("/assist", (req, res) => {
  // Validate request body against the schema
  const parse = In.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ error: "Invalid input", details: parse.error.errors });
  }

  // Extract validated data
  const { entityRegNo, fullName, idNumber, ownershipPct } = parse.data;

  try {
    // Simulate a compliance check or AI-assisted guidance (stubbed for now)
    const guidance = {
      message: "BO guidance generated (stub).",
      entityRegNo,
      fullName,
      idNumber,
      ownershipPct,
      complianceStatus: "pending", // Placeholder; could integrate with AI or DB later
    };

    // Return the guidance response
    return res.status(200).json(guidance);
  } catch (error) {
    console.error("Error processing BO request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Export the router for use in the main application
export default router;
