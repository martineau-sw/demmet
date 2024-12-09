import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const document = jsdom.window.document;

function parseEmmetToObject(str) {

  const regex = new RegExp(
    `^(?<tag>[a-z]+)?` +                // tag
    `(?<attributes>\\[[a-z=" ]+\\])?` + // attributes
    `(?<id>#[a-z-0-9]+)?` +             // id
    `(?<classes>(?:\\.[a-z-0-9]+)*)?` + // classes
    `(?<textContent>{[\\s\\S]+})?`      // text content
  );

  const groups = str.match(regex).groups;

  return {
    tag: groups.tag ? groups.tag : 'div',
    attributes: attributeMapFromString(groups.attributes),
    id: groups.id ? groups.id.substring(1) : undefined,
    classes: classListFromString(groups.classes), 
    textContent: groups.textContent ? groups.textContent.slice(1, -1) : undefined,
  };
}

function attributeMapFromString(attributesString) {
  if (!attributesString) return undefined;
  const attributeMap = {};
  const matches = [...attributesString.matchAll(/(?<attribute>[a-z-0-9]+)+(?:="(?<value>[^"]*)?")*/g)];
  matches.forEach(match => {
    attributeMap[match.groups.attribute] = match.groups.value ? match.groups.value : true;
  });
  return attributeMap;
}

function classListFromString(classString) {
  if (!classString) return undefined;
  return [...classString.matchAll(/\.[a-z-0-9]+/g)]
    .map(group => group[0].substring(1));
}

function elementFromObject(elementObject) {
  const element = document.createElement(elementObject.tag);


  if (elementObject.attributes !== undefined) {
    Object.keys(elementObject.attributes).forEach(key => {
      element.setAttribute(key, elementObject.attributes[key]);
    });
  }
  

  element.id = elementObject.id;

  if (elementObject.classes !== undefined) {
    elementObject.classes.forEach(cls => {
      element.classList.add(cls);
    });
  }

  element.textContent = elementObject.textContent;

  return element;
}

function create(emmetString) {
  return elementFromObject(parseEmmetToObject(emmetString))
}

export { parseEmmetToObject, create };