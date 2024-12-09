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
            :is="current"
            :data="filteredData"
            :key-col="keyCol"
            :val-col="valCol"
            :filters="options"
            :config="currentConfig"
          ></component>
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
      options: {},
      currentConfig: {
        width: "100%", // 800,
        height: "100%", // 600,
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
  },

  methods: {
    getChartType(string) {
      return string.trim().split("-").join("_");
    },

    getFilterName(string, joiner = "-") {
      console.log(string);
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
      // console.log("Updating filters");
      let filters = Object.keys(this.data[0]).filter(
        (col) => col !== this.keyCol && col !== this.valCol
      );

      filters.forEach((column) => {
        this.filters[column] = this.getUniqueValues(column);
        this.options[column] = this.filters[column][0];
      });

      console.log(this.filters);
    },
  },

  computed: {
    current() {
      const chartMap = {
        bar: "BarChart",
        line: "LineChart",
        pie: "PieChart",
        geo: "v-geo-chart",
        grouped_bar: "GroupedBarChart",
      };

      return chartMap[this.getChartType(this.type)];
    },

    filteredData() {
      // console.log("Filtering data");
      return this.data
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
};