import { Router } from "express";

const agentRoute = Router();
agentRoute.get("/", (req, res) => {
  res.json({
    success: true,
    data: "Hello world",
    error: null,
  });
});
export default agentRoute;
