const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const expoCli = path.join(projectRoot, "node_modules", "expo", "bin", "cli");
const output = fs.openSync(path.join(projectRoot, "expo-dev.log"), "a");
const errors = fs.openSync(path.join(projectRoot, "expo-dev.err.log"), "a");
const port = process.argv[2] || "8081";

const child = spawn(
  process.execPath,
  [expoCli, "start", "--lan", "--port", port],
  {
    cwd: projectRoot,
    detached: true,
    windowsHide: true,
    stdio: ["ignore", output, errors]
  }
);

child.unref();
console.log(`Started Expo with PID ${child.pid} on port ${port}`);
