const ChartContainer = {
  template: `
    <div class="v-chart chart--container">
      <div ref="controller" class="chart-controller">
        <v-filter
          v-for="(filter, feature) in filters"
          v-model="filter.selected"
          :key="feature"
          :id="id + '-' + feature"
          :feature="feature"
          :type="filter.type"
          :label="filter.label"
          :options="filter.options"
          :config="filter.config"
        ></v-filter>
      </div>

      <div class="chart-canvas">
        <component
          :data="filteredData"
          :is="currentType"
          :max-val="maxValue"
          :features="omit(features, ['filters'])"
          :config="currentConfig"
        ></component>

        <div>
          <p>No data available</p>
        </div>
      </div>
    </div>
  `,

  props: {
    id: { type: String, required: true },
    type: { type: String, required: true },
    features: { type: Object, required: true },
    data: { type: Array, default: () => [] },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      filters: {},
      filteredData: [],
      defaultConfig: {
        width: "100%",
        // width: 800,
        height: "100%",
        height: 400,
        projection: [
          // { method: "scale", args: [200] },
          // { method: "translate", args: [100, 100] },
        ],
        padding: {
          // x: 10,
          // y: 10,
          // inner: 0.02,
          // outer: 0.05,
        },
      },
    };
  },

  mounted() {
    console.log(this.data.find((d) => d[this.features.value] == this.maxValue));
    // this.updateData();
  },

  watch: {
    features: {
      deep: true,
      immediate: true,
      handler() {
        console.log("Features changed");
        // this.getFilters([], true);
        if (this.config.autoUpdate) {
          this.getFilters([], true);
        }
      },
    },

    filters: {
      deep: true,
      // immediate: true,
      handler: debounce(function () {
        console.log("Filters changed: ", this.filters);
        this.updateData();
      }, 200),
    },

    // config: {
    //   deep: true,
    //   immediate: true,
    //   handler() {
    //     console.log("Updating config...");
    //     console.log(this.config);
    //     console.log(this.defaultConfig);
    //     console.log(this.currentConfig);
    //   },
    // },
  },

  methods: {
    omit,

    getChartType(string) {
      return capitalizeFirstLetter(string, "-", "");
    },

    getUniqueValues(feature) {
      let values = this.data.map((item) => item[feature]);
      values = [...new Set(values)];
      return isNaN(values[0]) ? values : values.sort();
    },

    getFilters(excludes = [], inplace = false) {
      console.log("Generating filters...");

      const newFilters = {};

      if (this.features.filters) {
        for (const [feature, info] of Object.entries(this.features.filters)) {
          let options = this.getUniqueValues(feature);
          let type = info.type ?? info;
          let selected = info.default ?? options[0];

          newFilters[feature] = {
            type: type,
            options: options,
            selected: `${selected}`,
            label: info.label,
            config: info.config,
          };
        }
      } else {
        console.log("No filters specified. Generating default filters...");
        // console.log(excludes);

        let filters = Object.keys(this.data[0]).filter(
          (feature) =>
            feature !== this.features.key &&
            feature !== this.features.value &&
            !excludes.includes(feature)
        );

        filters.forEach((feature) => {
          let options = this.getUniqueValues(feature);

          newFilters[feature] = {
            type: isNaN(this.data[0][feature]) ? "dropdown" : "slider",
            options: options,
            selected: options[0],
            config: undefined,
          };
        });
      }

      // Recover selected values
      for (const [feature, filter] of Object.entries(this.filters)) {
        if (newFilters[feature]) {
          newFilters[feature].selected = filter.selected;
        }
      }

      if (inplace) {
        console.log("Updating filters INPLACE...");
        this.filters = newFilters;
      } else {
        console.log("Returning new filters...");
        return newFilters;
      }

      // return newFilters;
      // console.log({ ...this.filters });
    },

    updateData() {
      console.log("Updating data... Current filters: ", this.filters);

      this.filteredData = this.data
        .filter((data) => {
          for (const [feature, filter] of Object.entries(this.filters)) {
            if (data[feature] !== filter.selected) {
              return false;
            }
          }
          return true;
        })
        .map((data) => {
          if (!isNaN(data[this.features.value])) {
            data[this.features.value] = +data[this.features.value];
          }
          return data;
        });
    },
  },

  computed: {
    currentType() {
      const chartMap = {
        Bar: "v-bar-chart",
        Line: "v-line-chart",
        Pie: "v-pie-chart",
        Geo: "v-geo-chart",
        GroupedBar: "v-grouped-bar-chart",
      };

      return chartMap[this.getChartType(this.type)];
    },

    currentConfig() {
      return { ...this.defaultConfig, ...this.config };
    },

    maxValue() {
      return Math.max(...this.data.map((d) => d[this.features.value]));
    },

    minValue() {
      return Math.min(...this.data.map((d) => d[this.features.value]));
    },
  },
};
