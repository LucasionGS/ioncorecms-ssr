import BlockRegistry from "../core/BlockRegistry.ts";

BlockRegistry.register("quote_block", {
  displayName: "Quote Block",
  description: "A styled quote block with author and source attribution",
  icon: "quote",
  category: "content",
  fields: [
    {
      type: "textarea",
      name: "quote",
      label: "Quote",
      description: "The quote text",
      placeholder: "Enter the quote...",
      rows: 4,
      validation: {
        required: true,
        minLength: 10,
        maxLength: 1000
      },
      ui: {
        width: "full",
        order: 1
      }
    },
    {
      type: "text",
      name: "author",
      label: "Author",
      description: "The person who said or wrote this quote",
      placeholder: "Author name...",
      validation: {
        maxLength: 200
      },
      ui: {
        width: "half",
        order: 2
      }
    },
    {
      type: "text",
      name: "source",
      label: "Source",
      description: "The source of the quote (book, speech, etc.)",
      placeholder: "Source...",
      validation: {
        maxLength: 200
      },
      ui: {
        width: "half",
        order: 3
      }
    },
    {
      type: "select",
      name: "style",
      label: "Quote Style",
      description: "Visual style of the quote",
      defaultValue: "default",
      options: [
        { value: "default", label: "Default" },
        { value: "pullquote", label: "Pull Quote" },
        { value: "blockquote", label: "Block Quote" }
      ],
      ui: {
        width: "half",
        order: 4
      }
    }
  ],
  settings: {
    allowMultiple: true
  }
})