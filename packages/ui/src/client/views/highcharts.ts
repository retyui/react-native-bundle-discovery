// @ts-expect-error untyped vendored UMD bundle (resolves to `any`)
import Highcharts from "../../../vendors/highcharts.js";
import "../../../vendors/highcharts-networkgraph.js";
import "../../../vendors/highcharts-exporting.js";
import { doTheming } from "./_theme";

// `data` items are mutated in place from `{ value }` objects to raw values
type SeriesOptions = { data?: { value?: unknown }[] };

discovery.view.define("highcharts", (el, _config, rawData, context) => {
  doTheming(el as HTMLElement);

  if (Array.isArray(rawData?.options?.series)) {
    rawData.options.series.forEach((e: SeriesOptions) => {
      if (e.data?.[0]?.value !== undefined) {
        // mutate data by link
        e.data = e.data.map((d) => d.value ?? null) as SeriesOptions["data"];
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
