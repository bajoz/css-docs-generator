import { generateDocs } from '../index';

describe('index', () => {
  const noTags = `
    /**
    * Comment 1.
    */
    .foo {
      color: #fff;
    }

    /**
    * Another comment.
    */
    .bar {
      margin: 0 auto;
    }
  `;

  describe('single comment', () => {
    it('returns empty array if the section name is not defined', () => {
      const code = `
        /**
         * @description Button component.
         *
         * @class .btn Button class.
         * @class .btn--primary Primary button class.
         *
         * @markup
         * <div class="{{modifier}}">Button</div>
         */
         .btn {
           background-color: blue;
         }
      `;
      expect(generateDocs(code)).toEqual([]);
    });

    it('returns the section data', () => {
      const code = `
        /**
         * @name Button
         * @description Button component.
         *
         * @class .btn Button class.
         * @class .btn--primary Primary button class.
         *
         * @markup
         * <div class="{{modifier}}">Button</div>
         */
         .btn {
           background-color: blue;
         }
      `;
      const expected = [
        {
          name: 'Button',
          description: 'Button component.',
          classes: [
            {
              name: '.btn',
              description: 'Button class.',
              markup: '<div class="btn">Button</div>'
            },
            {
              name: '.btn--primary',
              description: 'Primary button class.',
              markup: '<div class="btn--primary">Button</div>'
            }
          ],
          markup: '<div class="{{modifier}}">Button</div>',
          subsections: []
        }
      ];

      expect(generateDocs(code)).toEqual(expected);
    });

    it('returns the section data without description', () => {
      const code = `
        /**
         * @name Button
         *
         * @class .btn Button class.
         * @class .btn--primary Primary button class.
         *
         * @markup
         * <div class="{{modifier}}">Button</div>
         */
         .btn {
           background-color: blue;
         }
      `;
      const expected = [
        {
          name: 'Button',
          description: null,
          classes: [
            {
              name: '.btn',
              description: 'Button class.',
              markup: '<div class="btn">Button</div>'
            },
            {
              name: '.btn--primary',
              description: 'Primary button class.',
              markup: '<div class="btn--primary">Button</div>'
            }
          ],
          markup: '<div class="{{modifier}}">Button</div>',
          subsections: []
        }
      ];

      expect(generateDocs(code)).toEqual(expected);
    });

    it('returns the section data without class descriptions', () => {
      const code = `
        /**
         * @name Button
         * @description Button component.
         *
         * @class .btn
         * @class .btn--primary
         *
         * @markup
         * <div class="{{modifier}}">Button</div>
         */
         .btn {
           background-color: blue;
         }
      `;
      const expected = [
        {
          name: 'Button',
          description: 'Button component.',
          classes: [
            {
              name: '.btn',
              description: null,
              markup: '<div class="btn">Button</div>'
            },
            {
              name: '.btn--primary',
              description: null,
              markup: '<div class="btn--primary">Button</div>'
            }
          ],
          markup: '<div class="{{modifier}}">Button</div>',
          subsections: []
        }
      ];

      expect(generateDocs(code)).toEqual(expected);
    });

    it('returns the section data without classes', () => {
      const code = `
        /**
         * @name Button
         * @description Button component.
         *
         * @markup
         * <div class="{{modifier}}">Button</div>
         */
         .btn {
           background-color: blue;
         }
      `;
      const expected = [
        {
          name: 'Button',
          description: 'Button component.',
          classes: [],
          markup: '<div class="{{modifier}}">Button</div>',
          subsections: []
        }
      ];

      expect(generateDocs(code)).toEqual(expected);
    });

    it('returns the section data without markup', () => {
      const code = `
        /**
         * @name Button
         * @description Button component.
         *
         * @class .btn Button class.
         * @class .btn--primary Primary button class.
         */
         .btn {
           background-color: blue;
         }
      `;
      const expected = [
        {
          name: 'Button',
          description: 'Button component.',
          classes: [
            {
              name: '.btn',
              description: 'Button class.',
              markup: null
            },
            {
              name: '.btn--primary',
              description: 'Primary button class.',
              markup: null
            }
          ],
          markup: null,
          subsections: []
        }
      ];

      expect(generateDocs(code)).toEqual(expected);
    });

    it('throws when the section does not exist', () => {
      const code = `
        /**
         * @name Button
         *
         * @class .btn Button class.
         * @class .btn--primary Primary button class.
         *
         * @markup
         * <div class="{{modifier}}">Button</div>
         *
         * @section Not a valid section.
         */
      `;

      expect(() => generateDocs(code)).toThrowError('Section "Not a valid section." does not exist');
    });
  });

  describe('multiple comments', () => {
    it('builds the section hierarchy tree', () => {
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

       /**
       * @name Another root section.
       */
      `;
      const expected = [
        {
          name: 'Root section.',
          description: null,
          classes: [],
          markup: null,
          subsections: [
            {
              name: 'Foo',
              description: null,
              classes: [],
              markup: null,
              subsections: [
                {
                  name: 'Bar',
                  description: 'Bar component.',
                  classes: [
                    {
                      name: '.bar',
                      description: 'Bar.',
                      markup: '<div class="bar">Bar</div>'
                    }
                  ],
                  markup: '<div class="{{modifier}}">Bar</div>',
                  subsections: []
                }
              ]
            }
          ]
        },
        {
          name: 'Another root section.',
          description: null,
          classes: [],
          markup: null,
          subsections: []
        }
      ];
      expect(generateDocs(code)).toEqual(expected);
    });
  });

  it('returns an empty array when no docs', () => {
    expect(generateDocs(noTags)).toEqual([]);
  });

  it('returns the root sections', () => {
    const code = `
      /**
       * @name Some section.
       */

      /**
       * @name Other section.
       */
    `;
    const expected = [
      {
        name: 'Some section.',
        description: null,
        classes: [],
        markup: null,
        subsections: []
      },
      {
        name: 'Other section.',
        description: null,
        classes: [],
        markup: null,
        subsections: []
      }
    ];

    expect(generateDocs(code)).toEqual(expected);
  });
});
