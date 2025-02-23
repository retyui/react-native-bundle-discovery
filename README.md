# react-native-bundle-discovery

> [!WARNING]
> Currently, everything is in a very early stage. The project is not yet ready for use.

**Links:**
- Build blocks for pages: https://discoveryjs.github.io/discovery/#views-showcase
- Jora syntax: https://discoveryjs.github.io/jora/#article:jora-syntax-operators

**TODO:**
- [ ] Search/filters
- [ ] bug: Code size is diff. treemap != badge info
- [ ] Diff page (to compare two versions bundle)
- [ ] Map based on the coverage (https://x.com/chromedevtools/status/1095411723161354240?lang=en)
- Static website (like  https://statoscope.tech)
  - [ ] website
  - [ ] auto deploy
  - [ ] drag and drop `stats.json`
- [x] Large tree maps https://www.highcharts.com/demo/highcharts/treemap-large-dataset or https://github.com/evmar/webtreemap
- Reports:
  - [ ] top 10 largest modules
  - [ ] top 10 largest files
  - [ ] Dead code detection (as example ios only code in an android bundle, never used exports, etc ...)
  - [x] Duplicate modules detection
  - [ ] Custom reports
- CI/CD reports 
 - [ ] changes in bundle size (size, files, modules)
