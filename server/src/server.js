import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, "0.0.0.0", () => {
  console.log(`V4 Softronic API listening on http://localhost:${config.port}`);
});
