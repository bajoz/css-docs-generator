# css-docs-generator
`css-docs-generator` is a package that generates css docs from the css comments.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save css-docs-generator
```

Install with yarn:

```sh
$ yarn add css-docs-generator
```

## Usage

```javascript
import {extract, organise} from 'css-docs-generator';

const code = `
  /**
   * @name Root section.
   */

  /**
   * @name Foo
   * @section Root section.
   */

  /**
   * @name Bar
   * @description Bar component.
   *
   * @class .bar Bar.
   *
   * @markup
   * <div class="{{modifier}}">Bar</div>
   *
   * @section Foo
   */
   .bar {
     background-color: yellow;
   }

  /**
   * @name Another root section.
   */
`;

const docs = organise(extract(code));
console.log(docs);

// Will output:
// {
//   roots: ['Root section.', 'Another root section.'],
//   sections: [
//     {
//       name: 'Root section.',
//       description: null,
//       classes: [],
//       markup: null,
//       subsections: ['Foo']
//     },
//     {
//       name: 'Foo',
//       description: null,
//       classes: [],
//       markup: null,
//       subsections: ['Bar']
//     },
//     {
//       name: 'Bar',
//       description: 'Bar component.',
//       classes: [
//         {
//           name: '.bar',
//           description: 'Bar.',
//           markup: '<div class="bar">Bar</div>'
//         }
//       ],
//       markup: '<div class="{{modifier}}">Bar</div>',
//       subsections: []
//     },
//     {
//       name: 'Another root section.',
//       description: null,
//       classes: [],
//       markup: null,
//       subsections: []
//     }
//   ]
// }
```
