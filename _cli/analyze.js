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
    throw new Error(`Failed to read report file: ${filePath}\n${error.message}`);
  }
}

function collectRecommendations(report) {
  return recommendations
    .map((recommendation) => {
      const finding = recommendation.check(report);
      if (!finding) {
        return null;
      }

      return {
        id: recommendation.id,
        title: recommendation.title,
        ...finding,
      };
    })
    .filter(Boolean);
}

function printDefaultFormat(filePath, findings) {
  const prettyPath = chalk.cyan(filePath);

  if (findings.length === 0) {
    console.log(`${chalk.green("No optimization recommendations found for")} ${prettyPath}.`);
    return;
  }

  const recommendationLabel = findings.length === 1 ? "recommendation" : "recommendations";
  console.log(
    `${chalk.bold.green("Found")} ${chalk.bold(findings.length)} ${chalk.green(`${recommendationLabel}:`)}`,
  );
  console.log(`${chalk.dim("Report:")} ${prettyPath}`);
  console.log();

  findings.forEach((finding, index) => {
    console.log(`${chalk.bold.yellow(`${index + 1}.`)} ${chalk.bold(finding.title)}`);

    if (finding.message) {
      console.log(`   ${chalk.blue("Why:")} ${finding.message}`);
    }

    if (finding.packages && finding.packages.length > 0) {
      console.log(`   ${chalk.magenta("Packages:")} ${finding.packages.join(", ")}`);
    }

    if (finding.docsUrl) {
      const docs = Array.isArray(finding.docsUrl) ? finding.docsUrl.join(", ") : finding.docsUrl;
      console.log(`   ${chalk.cyan("Links:")} ${chalk.underline(docs)}`);
    }

    if (index < findings.length - 1) {
      console.log(chalk.dim("   ----------------------------------------"));
    }
  });
}

function printJsonFormat(filePath, findings) {
  console.log(
    JSON.stringify(
      {
        file: filePath,
        recommendations: findings,
      },
      null,
      2,
    ),
  );
}

function printAnalyzeReport(filePath, options = {}) {
  const { format = "default" } = options;
  const report = readBuildReport(filePath);
  const findings = collectRecommendations(report);

  switch (format) {
    case "json":
      printJsonFormat(filePath, findings);
      break;
    default:
      printDefaultFormat(filePath, findings);
  }
}

module.exports = {
  printAnalyzeReport,
};
