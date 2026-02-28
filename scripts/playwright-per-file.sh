#!/usr/bin/env bash

set -u
set -o pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

timestamp="$(date +%Y%m%d-%H%M%S)"
report_root="$ROOT_DIR/playwright-report/per-file-$timestamp"
max_files=""
declare -a projects=()

usage() {
  cat <<'EOF'
Run Playwright one test file at a time and emit one HTML report per file.

Usage:
  bash scripts/playwright-per-file.sh [--project <name>]... [--report-root <path>] [--max-files <n>]

Defaults:
  --project chromium
  --report-root ./playwright-report/per-file-<timestamp>

Examples:
  bash scripts/playwright-per-file.sh --project chromium
  bash scripts/playwright-per-file.sh --project auth-chromium --project public-chromium
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --)
      shift
      ;;
    --project)
      projects+=("$2")
      shift 2
      ;;
    --report-root)
      report_root="$2"
      shift 2
      ;;
    --max-files)
      max_files="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ ${#projects[@]} -eq 0 ]]; then
  projects=("chromium")
fi

mkdir -p "$report_root"
summary_file="$report_root/summary.md"

echo "# Playwright Per-File Report" > "$summary_file"
echo "" >> "$summary_file"
echo "- Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$summary_file"
echo "- Root: $report_root" >> "$summary_file"
echo "- Projects: ${projects[*]}" >> "$summary_file"
echo "" >> "$summary_file"
echo "| Project | File | Status | Report | Log |" >> "$summary_file"
echo "|---|---|---|---|---|" >> "$summary_file"

collect_files_for_project() {
  local project="$1"
  case "$project" in
    auth-*)
      find e2e/auth -type f -name '*.spec.ts' | sort
      ;;
    public-*)
      find e2e/public -type f -name '*.spec.ts' | sort
      ;;
    setup)
      find e2e/setup -type f -name '*.setup.ts' | sort
      ;;
    *)
      find e2e -type f -name '*.spec.ts' \
        ! -path 'e2e/auth/*' \
        ! -path 'e2e/public/*' \
        ! -path 'e2e/setup/*' | sort
      ;;
  esac
}

overall_status=0

for project in "${projects[@]}"; do
  files=()
  while IFS= read -r line; do
    files+=("$line")
  done < <(collect_files_for_project "$project")

  if [[ -n "$max_files" ]]; then
    files=("${files[@]:0:$max_files}")
  fi

  if [[ ${#files[@]} -eq 0 ]]; then
    echo "No matching files for project: $project"
    continue
  fi

  for file in "${files[@]}"; do
    rel="${file#e2e/}"
    safe="${rel//\//__}"
    safe="${safe%.spec.ts}"
    safe="${safe%.setup.ts}"
    run_dir="$report_root/$project/$safe"
    mkdir -p "$run_dir"
    log_file="$run_dir/run.log"

    echo "Running [$project] $file"
    set +e
    PLAYWRIGHT_HTML_OUTPUT_DIR="$run_dir" \
      pnpm exec playwright test "$file" --project="$project" 2>&1 | tee "$log_file"
    rc=${PIPESTATUS[0]}
    set -e

    if [[ $rc -eq 0 ]]; then
      status="pass"
    else
      status="fail($rc)"
      overall_status=1
    fi

    report_path="$run_dir/index.html"
    printf '| `%s` | `%s` | `%s` | `%s` | `%s` |\n' \
      "$project" "$file" "$status" "$report_path" "$log_file" >> "$summary_file"
  done
done

echo ""
echo "Per-file report summary: $summary_file"
exit $overall_status
