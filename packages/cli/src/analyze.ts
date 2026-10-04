import {
  collectRecommendations,
  type RecommendationFinding,
} from "@react-native-bundle-discovery/shared";
import chalk from "chalk";
import { readBuildReport } from "./readReport";
import { formatBytes } from "./utils";

type AnalyzeFinding = RecommendationFinding;

function printDefaultFormat(filePath: string, findings: AnalyzeFinding[]) {
  const prettyPath = chalk.cyan(filePath);

  if (findings.length === 0) {
    console.log(
      `${chalk.green("No optimization recommendations found for")} ${prettyPath}.`,
    );
    return;
  }

  const recommendationLabel =
    findings.length === 1 ? "recommendation" : "recommendations";
  console.log(
    `${chalk.bold.green("Found")} ${chalk.bold(findings.length)} ${chalk.green(`${recommendationLabel}:`)}`,
  );
  console.log(`${chalk.dim("Report:")} ${prettyPath}`);
  console.log();

  findings.forEach((finding, index) => {
    console.log(
      `${chalk.bold.yellow(`${index + 1}.`)} ${chalk.bold(finding.title)}`,
    );

    if (finding.packages && finding.packages.length > 0) {
      console.log(`   ${chalk.magenta("Packages:")} ${finding.packages}`);
    }

    if (finding.sizeInBytes) {
      console.log(
        `   ${chalk.green("Savings:")} ~${formatBytes(finding.sizeInBytes)}`,
      );
    }

    if (finding.docsUrl) {
      const docs = Array.isArray(finding.docsUrl)
        ? finding.docsUrl.join(", ")
        : finding.docsUrl;
      console.log(`   ${chalk.cyan("Links:")} ${chalk.underline(docs)}`);
    }

    if (finding.message) {
      const prefix = `   ${chalk.blue("Why:")} `;
      const offset = "        ";
      console.log(`${prefix}${finding.message.replace(/\n/g, `\n${offset}`)}`);
    }

    if (index < findings.length - 1) {
      console.log(chalk.dim("\n   ----------------------------------------\n"));
    }
  });
}

export function printAnalyzeReport(
  filePath: string,
  { format = "default" }: { format?: string } = {},
): void {
  const report = readBuildReport(filePath, format);
  if (report?.transformOptions?.dev !== false) {
    throw new Error(
      "Analyze requires a production report generated with --dev false.",
    );
  }
  const findings = collectRecommendations(report);
  if (format === "json") {
    console.log(JSON.stringify(findings, null, 2));
    return;
  }
  printDefaultFormat(filePath, findings);
}
