function debounce(func, delay = 300) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
}

function capitalizeFirstLetter(string, separator = " ", joiner = " ") {
  return string
    .split(separator)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(joiner);
}