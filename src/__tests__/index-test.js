import { extract, organise } from '../index';

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

  describe('extract()', () => {
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
      expect(extract(code)).toEqual([]);
    });

    it('returns the extracted comment', () => {
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
          section: null
        }
      ];

      expect(extract(code)).toEqual(expected);
    });

    it('returns the comment without description', () => {
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
          section: null
        }
      ];

      expect(extract(code)).toEqual(expected);
    });

    it('returns the comment without class descriptions', () => {
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
          section: null
        }
      ];

      expect(extract(code)).toEqual(expected);
    });

    it('returns the comment without classes', () => {
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
          section: null
        }
      ];

      expect(extract(code)).toEqual(expected);
    });

    it('returns the comment without markup', () => {
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
          section: null
        }
      ];

      expect(extract(code)).toEqual(expected);
    });
  });

  describe('organise()', () => {
    it('builds the subsections', () => {
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
      const expected = {
        roots: ['Root section.', 'Another root section.'],
        sections: [
          {
            name: 'Root section.',
            description: null,
            classes: [],
            markup: null,
            subsections: ['Foo']
          },
          {
            name: 'Foo',
            description: null,
            classes: [],
            markup: null,
            subsections: ['Bar']
          },
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
          },
          {
            name: 'Another root section.',
            description: null,
            classes: [],
            markup: null,
            subsections: []
          }
        ]
      };
      expect(organise(extract(code))).toEqual(expected);
    });

    it('returns an empty array when no docs', () => {
      expect(organise(extract(noTags))).toEqual({
        roots: [],
        sections: []
      });
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

      expect(() => organise(extract(code))).toThrowError('Section "Not a valid section." does not exist');
    });
  });
});
