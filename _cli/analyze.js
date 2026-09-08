const path = require("path");
const chalk = require("chalk");
const { prepareReport } = require("./prepare.js");
const recommendations = require("./recommendations/index.js");

function readBuildReport(filePath) {
  try {
    // Resolve from current working directory to support relative CLI paths.
    const resolvedPath = path.resolve(filePath);
    const report = require(resolvedPath);
    return prepareReport(report);
  } catch (error) {
    throw new Error(
      `Failed to read report file: ${filePath}\n${error.message}`,
    );
  }
}

function collectRecommendations(report) {
  return recommendations
    .flatMap((recommendation) => {
      const finding = recommendation.check(report);
      if (!finding) {
        return null;
      }

      return (Array.isArray(finding) ? finding : [finding]).map((f) => {
        return {
          id: recommendation.id,
          title: recommendation.title,
          ...f,
        };
      });
    })
    .filter(Boolean);
}

function printDefaultFormat(filePath, findings) {
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

    if (finding.message) {
      const prefix = `   ${chalk.blue("Why:")} `;
      const offset = "        ";
      console.log(`${prefix}${finding.message.replace(/\n/g, "\n" + offset)}`);
    }

    if (finding.packages && finding.packages.length > 0) {
      console.log(`   ${chalk.magenta("Packages:")} ${finding.packages}`);
    }

    if (finding.docsUrl) {
      const docs = Array.isArray(finding.docsUrl)
        ? finding.docsUrl.join(", ")
        : finding.docsUrl;
      console.log(`   ${chalk.cyan("Links:")} ${chalk.underline(docs)}`);
    }

    if (index < findings.length - 1) {
      console.log(chalk.dim("\n   ----------------------------------------\n"));
    }
  });
}

function printAnalyzeReport(filePath, { format = "default" } = {}) {
  const report = readBuildReport(filePath);
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

module.exports = {
  printAnalyzeReport,
};
