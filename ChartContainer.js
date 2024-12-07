const ChartContainer = {
  template: `
      <div class="chart--container">
        <div class="chart-controller">
          <div
            v-for="filter, index in filters"
            class="chart-filter"
          >
            <label :for="getFilterId(filter)">
              {{ getFilterName(filter, " ") }}:
            </label>

            <select
              v-model="options[filter]"
              v-if="data[0][filter] && isNaN(data[0][filter])"
              :id="getFilterId(filter)"
            >
              <option
                v-for="value, index in getUniqueValues(filter)"
                :value="value"
                :selected="index === 0"
              >
                {{ value }}
              </option>
            </select>

            <input
              type="range"
              v-model="options[filter]"
              v-else
              :id="getFilterId(filter)"
              :value="options[filter]"
              :min="Math.min(...getUniqueValues(filter))"
              :max="Math.max(...getUniqueValues(filter))"
            />

            <span>{{ options[filter] }}</span>
          </div>
        </div>
        <div class="chart-canvas">
          <component
            :is="current"
            :data="data"
            :filters="options"
            :config="currentConfig"
          ></component>
        </div>
      </div>
    `,

  props: {
    id: { type: String, required: true },
    data: { type: Array, required: true },
    type: { type: String, required: true },
    keyCol: { type: String, required: true },
    valCol: { type: String, required: true },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      filters: [],
      options: {},
      currentConfig: {
        width: "100%",
        height: "100%",
        projection: [
          // { method: "scale", args: [200] },
          // { method: "translate", args: [100, 100] },
        ],
      },
    };
  },

  mounted() {
    // console.log(this.$refs.svg);
    // this.chart = new Chart(this.$refs.svg.getContext("2d"), {
    //   type: this.dataset.type,
    //   data: this.dataset.data,
    //   options: this.dataset.options,
    // });
  },

  watch: {
    data: "updateFilters",
    keyCol: "updateFilters",
    valCol: "updateFilters",
    options: {
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
      this.filters = this.data[0]
        ? Object.keys(this.data[0]).filter(
            (col) => col !== this.keyCol && col !== this.valCol
          )
        : [];
      this.filters.forEach((filter) => {
        this.options[filter] = this.getUniqueValues(filter)[0];
      });
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
  },
};