import { extract, parse } from 'comment-tag-extractor';

const isArrayEmpty = array => !Array.isArray(array) || array.length === 0;

const first = (array, defaultValue = null) => {
  if (isArrayEmpty(array)) {
    return defaultValue;
  }
  return array[0];
};

const generateClasses = (classes, markup) => {
  if (isArrayEmpty(classes)) {
    return [];
  }

  return classes
    .map(cls => {
      const words = cls.split(' ');
      const name = words.length > 0 ? words[0] : null;
      const description = words.length > 1 ? words.slice(1).join(' ') : null;
      return { name, description };
    })
    .map(({ name, description }) => {
      return {
        name,
        description,
        // replace {{modifier}} with the class name
        markup: markup && markup.replace('{{modifier}}', name.replace(/^\./, ''))
      };
    });
};

const generateComment = comment => {
  if (isArrayEmpty(comment.name)) {
    return null;
  }

  const markup = first(comment.markup);

  return {
    name: first(comment.name),
    description: first(comment.description),
    classes: generateClasses(comment['class'], markup),
    section: first(comment.section),
    subsections: [],
    markup
  };
};

const buildSectionTree = comments => {
  // build hashtable where keys are all section names
  // { [section name]: [section obj] }
  const dict = comments.reduce((acc, comment) => {
    acc[comment.name.toLowerCase()] = comment;
    return acc;
  }, {});

  const roots = comments.filter(comment => !comment.section);
  const subsections = comments.filter(comment => comment.section);

  subsections.forEach(comment => {
    // throw an error if the specified section does not exist
    if (!dict[comment.section.toLowerCase()]) {
      throw new Error(`Section "${comment.section}" does not exist`);
    }
    dict[comment.section.toLowerCase()].subsections.push(comment);
  });

  // clear the section field
  Object.values(dict).forEach(comment => {
    delete comment.section;
  });

  return roots;
};

export const generateDocs = code => {
  const extractedComments = parse(extract(code));
  const comments = extractedComments.map(generateComment).filter(comment => comment);

  return buildSectionTree(comments);
};
