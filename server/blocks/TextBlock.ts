import BlockRegistry from "../core/BlockRegistry.ts";

BlockRegistry.register("text_block", {
  displayName: "Text Block",
  description: "A simple text content block with formatting options",
  icon: "text",
  category: "content",
  fields: [
    {
      type: "textarea",
      name: "content",
      label: "Content",
      description: "The text content for this block",
      placeholder: "Enter your text content...",
      rows: 6,
      validation: {
        required: true,
        minLength: 1,
        maxLength: 5000
      },
      ui: {
        width: "full",
        order: 1
      }
    },
    {
      type: "select",
      name: "alignment",
      label: "Text Alignment",
      description: "How the text should be aligned",
      defaultValue: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ],
      ui: {
        width: "half",
        order: 2
      }
    }
  ],
  settings: {
    allowMultiple: true
  }
})