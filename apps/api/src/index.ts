import { config } from "./config";
import { app } from "./app";

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
