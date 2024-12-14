const ChartContainer = {
  template: `
      <div class="v-chart chart--container">
        <div class="chart-controller">
          <div
            v-for="(values, column) in filters"
            class="chart-filter"
          >
            <label :for="getFilterId(column)">
              {{ getFilterName(column, " ") }}:
            </label>

            <select
              v-model="options[column]"
              v-if="isNaN(data[0][column])"
              :id="getFilterId(column)"
            >
              <option
                v-for="value, index in values"
                :value="value"
                :selected="index === 0"
              >
                {{ value }}
              </option>
            </select>

            <input
              type="range"
              v-model="options[column]"
              v-else
              :id="getFilterId(column)"
              :value="options[column]"
              :min="Math.min(...values)"
              :max="Math.max(...values)"
            />

            <span>{{ options[column] }}</span>
          </div>
        </div>
        <div class="chart-canvas">
          <component
            v-if="filteredData.length > 0"
            v-bind:data="filteredData"
            :is="current"
            :key-col="keyCol"
            :val-col="valCol"
            :max-val="maxValue"
            :filters="options"
            :config="currentConfig"
            color="YlOrRd"
          ></component>

          <div v-else>
            <p>No data available</p>
          </div>
        </div>
      </div>
    `,

  props: {
    id: { type: String, required: true },
    type: { type: String, required: true },
    keyCol: { type: String, required: true },
    valCol: { type: String, required: true },
    data: { type: Array, default: () => [] },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      filters: {},
      filteredData: [],
      options: {},
      currentConfig: {
        width: "100%",
        width: 800,
        height: "100%",
        height: 400,
        projection: [
          // { method: "scale", args: [200] },
          // { method: "translate", args: [100, 100] },
        ],
      },
    };
  },

  mounted() {
    this.updateFilters();
  },

  watch: {
    keyCol: "updateFilters",
    valCol: "updateFilters",
    config: {
      deep: true,
      handler() {
        // console.log("Updating options");
        // console.log(this.currentConfig);
        for (let config in this.config) {
          this.currentConfig[config] = this.config[config];
        }
        // console.log(this.currentConfig);
      },
    },
    options: {
      deep: true,
      handler: debounce(function () {
        this.updateData();
      }, 200),
    },
  },

  methods: {
    getChartType(string) {
      return string.trim().split("-").join("_");
    },

    getFilterName(string, joiner = "-") {
      return string
        .trim()
        .split(/\.?(?=[A-Z])/)
        .join(joiner);
    },

    getFilterId(string) {
      return this.id + "-filter-" + this.getFilterName(string).toLowerCase();
    },

    getUniqueValues(column) {
      let values = this.data.map((item) => item[column]);
      values = [...new Set(values)];
      return isNaN(values[0]) ? values : values.sort();
    },

    updateFilters() {
      let filters = Object.keys(this.data[0]).filter(
        (col) => col !== this.keyCol && col !== this.valCol
      );

      filters.forEach((column) => {
        this.filters[column] = this.getUniqueValues(column);
        this.options[column] = this.filters[column][0];
      });

      console.log("Updating filters", this.filters);
    },

    updateData() {
      console.log("Updating data... Current filter options: ", this.options);
      this.filteredData = this.data
        .filter((data) => {
          for (const [key, value] of Object.entries(this.options)) {
            if (data[key] !== value) {
              return false;
            }
          }
          return true;
        })
        .map((data) => {
          if (!isNaN(data[this.valCol])) {
            data[this.valCol] = +data[this.valCol];
          }
          return data;
        });
    },
  },

  computed: {
    current() {
      const chartMap = {
        bar: "v-bar-chart",
        line: "v-line-chart",
        pie: "v-pie-chart",
        geo: "v-geo-chart",
        grouped_bar: "v-grouped-bar-chart",
      };

      return chartMap[this.getChartType(this.type)];
    },

    maxValue() {
      return Math.max(...this.data.map((d) => d[this.valCol]));
    },
  },
};
