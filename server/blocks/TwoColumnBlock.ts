import BlockRegistry from "../core/BlockRegistry.ts";

BlockRegistry.register("two_column_block", {
  displayName: "Two Column Block",
  description: "A flexible two-column layout block",
  icon: "columns",
  category: "layout",
  fields: [
    {
      type: "blocks",
      name: "leftContent",
      label: "Left Column Content",
      description: "Content for the left column",
      placeholder: "Enter left column content...",
    },
    {
      type: "blocks",
      name: "rightContent",
      label: "Right Column Content",
      description: "Content for the right column",
      placeholder: "Enter right column content...",
    },
    {
      type: "select",
      name: "columnRatio",
      label: "Column Ratio",
      description: "The ratio between left and right columns",
      defaultValue: "50-50",
      options: [
        { value: "50-50", label: "50% / 50%" },
        { value: "60-40", label: "60% / 40%" },
        { value: "40-60", label: "40% / 60%" },
        { value: "70-30", label: "70% / 30%" },
        { value: "30-70", label: "30% / 70%" }
      ],
      ui: {
        width: "half",
        order: 3
      }
    }
  ],
  settings: {
    allowMultiple: true
  }
})