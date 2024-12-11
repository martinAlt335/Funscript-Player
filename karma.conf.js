// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require("path");

module.exports = function (config) {
  config.set({
    basePath: "src",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      jasmine: {
        random: false, // Set to 'true' for random test order, 'false' for deterministic order
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes duplicated traces
    },
    coverageReporter: {
      dir: path.join(__dirname, "coverage/frontend"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },
    reporters: ["progress", "kjhtml"],
    browsers: ["ChromeHeadlessNoSandbox"],
    restartOnFileChange: false,
    singleRun: true, // Set to true if you want to run tests once and not watch for file changes
    autoWatch: false, // Set to true to keep watching for changes
  });
};
