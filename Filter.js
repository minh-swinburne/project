const Filter = {
  template: `
    <div class="chart-filter">
      <label :for="filterId">
        {{ getName(" ", false) }}:
      </label>

      <select
        v-if="type === 'dropdown'"
        :value="modelValue"
        :id="filterId"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option
          v-for="option, index in options"
          :key="index"
          :value="option"
          :selected="index === 0"
        >
          {{ option }}
        </option>
      </select>

      <input
        type="range"
        v-if="type === 'slider'"
        :value="modelValue"
        :id="filterId"
        :min="Math.min(...options)"
        :max="Math.max(...options)"
        @input="$emit('update:modelValue', $event.target.value)"
      />

      <span>{{ modelValue }}</span>
    </div>
  `,

  props: {
    id: { type: String, required: true },
    type: { type: String, required: true },
    feature: { type: String, required: true },
    options: { type: Array, required: true },
    modelValue: { type: String, required: true },
  },

  emits: ["update:modelValue"],

  // data() {
  //   return {
  //     selected: null,
  //   };
  // },

  // mounted() {
  //   this.selected = this.options[0];
  // },

  methods: {
    update() {
      this.$emit("update", this.selected);
    },

    getName(joiner = "-", lower = true) {
      let result = this.feature
        .trim()
        .split(/\.?(?=[A-Z])/)
        .join(joiner);
      return lower ? result.toLowerCase() : result;
    },
  },

  computed: {
    filterId() {
      return `${this.id}-filter-${this.getName()}`;
    },
  },
};