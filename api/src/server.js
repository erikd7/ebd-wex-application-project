import app from "./app.js";
import log from "./util/logger.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  log.info(`Server listening on localhost:${PORT}`);
});
