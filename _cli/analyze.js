const path = require("path");
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
  if (findings.length === 0) {
    console.log(`No optimization recommendations found for ${filePath}.`);
    return;
  }

  console.log(`Found ${findings.length} optimization recommendation(s):`);

  findings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding.title}`);
    if (finding.message) {
      console.log(`   Why: ${finding.message}`);
    }
    if (finding.packages && finding.packages.length > 0) {
      console.log(`   Packages: ${finding.packages.join(", ")}`);
    }
    if (finding.docsUrl) {
      console.log(`   Docs: ${finding.docsUrl}`);
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

