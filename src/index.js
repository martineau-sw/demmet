
function createElement(tag = 'div', attributes = {}, id = undefined, classes = [], content = undefined) {
  const element = document.createElement(tag);

  Object.keys(attributes).forEach(key => {
    element.setAttribute(key, attributes[key]);
  });

  element.id = id;

  classes.forEach(cls => {
    element.classList.add(cls);
  });

  element.textContent = content;

  return element;
}

export { splitEmmetToken };