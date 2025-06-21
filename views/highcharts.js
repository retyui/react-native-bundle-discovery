const Highcharts = require("highcharts");

require("highcharts/modules/heatmap");
require("highcharts/modules/treemap");
require("highcharts/modules/networkgraph");
require("highcharts/modules/exporting");

const { doTheming } = require("./_theme");

discovery.view.define("highcharts", function (el, config, rawData, context) {
  doTheming(el);

  if (Array.isArray(rawData?.options?.series)) {
    rawData.options.series.forEach((e) => {
      if (e.data?.[0]?.value !== undefined) {
        // mutate data by link
        e.data = e.data.map((d) => d.value ?? null);
      }
    });
  }

  // console.log({ rawData });

  try {
    Highcharts.chart(
      el,
      Highcharts.merge(
        {
          // default options
        },
        rawData.options,
      ),
    );
  } catch (e) {
    console.error(e, rawData);
    discovery.view.render(
      el,
      {
        view: "alert-danger",
        data: '"Error rendering chart, please check the console for more information."',
      },
      rawData,
      context,
    );
  }
});
