import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";

function resolveRepoRoot() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
}

function readStagedFiles() {
  const output = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"],
    {
      encoding: "buffer",
    },
  );

  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter((file) => existsSync(file) && statSync(file).isFile());
}

function runPrettier(files) {
  const commands = [
    ["pnpm", ["exec", "prettier", "--write", "--ignore-unknown", ...files]],
    [
      "corepack",
      ["pnpm", "exec", "prettier", "--write", "--ignore-unknown", ...files],
    ],
  ];

  for (const [command, args] of commands) {
    try {
      execFileSync(command, args, { stdio: "inherit" });
      return;
    } catch (error) {
      if (error?.code === "ENOENT" || error?.status === 127) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "pre-commit: neither pnpm nor corepack is available in PATH for prettier",
  );
}

function restage(files) {
  execFileSync("git", ["add", "--", ...files], { stdio: "inherit" });
}

process.chdir(resolveRepoRoot());

const stagedFiles = readStagedFiles();
if (stagedFiles.length === 0) {
  process.exit(0);
}

runPrettier(stagedFiles);
restage(stagedFiles);
