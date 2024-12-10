import { JSDOM } from 'jsdom';

const jsdom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
const document =  jsdom.window.document;
const Node = jsdom.window.Node;
const HTMLElement = jsdom.window.HTMLElement;
const HTMLTemplateElement = jsdom.window.HTMLTemplateElement;

function parseEmmetToObject(str) {

  const regex = new RegExp(
    `^(?<tag>[a-z]+)?` +                // tag
    `(?<attributes>\\[[a-z-0-9=" ]+?\\])?` + // attributes
    `(?<id>#[a-z-0-9]+)?` +             // id
    `(?<classes>(?:\\.[a-z-0-9]+)*)?` + // classes
    `(?<textContent>{[\\s\\S]+?})?`      // text content
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

function tokenizeEmmet(emmetString) {
  const regex = new RegExp(
    `(?<tag>[a-z]+)?` +                // tag
    `(?<attributes>\\[[a-z-0-9=" ]+?\\])?` + // attributes
    `(?<id>#[a-z-0-9]+)?` +             // id
    `(?<classes>(?:\\.[a-z-0-9]+)*)?` + // classes
    `(?<textContent>{[\\s\\S]+?})?`      // text content
  , 'g');

  const matches = [...emmetString.matchAll(regex)].filter(match => match[0].length > 0);
  const tokens = [];
  matches.forEach( (match, index) => {
    tokens.push(match[0]);
    let end;
    if (index + 1 < matches.length) {
      end = matches[index + 1].index;
    } 
    const token = emmetString.slice(match.index + match[0].length, end);
    if (token.length > 0)
      tokens.push(token);
  });
  const template = document.createElement('template');
  let last = template.content.appendChild(create(tokens.shift()));
  let operator = tokens.shift();
  while (operator) {
    let operand = tokens.length > 0 ? create(tokens.shift()) : undefined;
    switch (operator.at(0)) {
      case '+':
        last = template.content.appendChild(operand);
        break;
      case '>':
        last = last.appendChild(operand);
        break;
      case '*':
        let num = +operator.slice(1);
        for(; num > 1; num--) {
          last.after(last.cloneNode(true));
        }
        break;
    }
    operator = tokens.shift();
  }
  return template;
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
  const node = document.createElement(elementObject.tag);

  if (elementObject.attributes !== undefined) {
    Object.keys(elementObject.attributes).forEach(key => {
      node.setAttribute(key, elementObject.attributes[key]);
    });
  }

  if (elementObject.id !== undefined) {
    node.id = elementObject.id;
  }

  if (elementObject.classes !== undefined) {
    elementObject.classes.forEach(cls => {
      node.classList.add(cls);
    });
  }

  if (elementObject.textContent !== undefined) {
    node.textContent = elementObject.textContent;
  }
  
  return node;
}

function create(emmetString) {
  return elementFromObject(parseEmmetToObject(emmetString));
}

tokenizeEmmet('div#id{hello world}+div[flag-9].class{dfadsf}');

export { tokenizeEmmet, parseEmmetToObject, create, document, Node, HTMLTemplateElement };