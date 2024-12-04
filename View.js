const ViewContainer = {
  template: `
      <div class="view-container">
        <div class="view-controller">
          <button
            v-for="dataset, index in datasets"
            :data-index="index"
            :class="{ active: dataset.id === this.current.id }"
            @click="switchDataset"
            >
            {{ dataset.name }}
          </button>
        </div>
        <div class="view-title">
          <h2>{{ current.title }}</h2>
          <p>{{ current.description }}</p>
        </div>
        <chart-container
          :path="path"
          :file="current.file"
          :charts="current.charts">
        </chart-container>
      </div>
    `,
  props: ["path"],
  data() {
    return {
      datasets: [],
      current: {
        id: "",
        title: "",
        description: "",
      },
    };
  },
  methods: {
    async loadJson(file) {
      return fetch(this.path + "/" + file).then((response) => response.json());
    },
    switchDataset(event) {
      let idx = parseInt(event.target.getAttribute("data-index"));
      this.current = this.datasets[idx];
      console.log("Switching to dataset with index " + idx);
    },
  },
  mounted() {
    this.loadJson("view.json").then((data) => {
      this.datasets = data;
      this.current = data[0];
    });
  },
};
