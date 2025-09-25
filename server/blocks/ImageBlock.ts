import BlockRegistry from "../core/BlockRegistry.ts";

BlockRegistry.register("image_block", {
  displayName: "Image Block",
  description: "An image block with caption and alignment options",
  icon: "image",
  category: "media",
  fields: [
    {
      type: "file",
      name: "image",
      label: "Image",
      description: "Select an image file",
      accept: "image/*",
      validation: {
        required: true
      },
      ui: {
        width: "full",
        order: 1
      }
    },
    {
      type: "text",
      name: "alt",
      label: "Alt Text",
      description: "Alternative text for accessibility",
      placeholder: "Describe the image...",
      validation: {
        required: true,
        maxLength: 200
      },
      ui: {
        width: "full",
        order: 2
      }
    },
    {
      type: "text",
      name: "caption",
      label: "Caption",
      description: "Optional caption displayed below the image",
      placeholder: "Enter image caption...",
      validation: {
        maxLength: 500
      },
      ui: {
        width: "full",
        order: 3
      }
    },
    {
      type: "select",
      name: "alignment",
      label: "Alignment",
      description: "How the image should be aligned",
      defaultValue: "center",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
        { value: "full", label: "Full Width" }
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