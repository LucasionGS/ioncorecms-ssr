import { Model, DataTypes } from "sequelize";
import sequelize from "../../sequelize.ts";
import NodeRegistry from "../../../core/NodeRegistry.ts";
import User from "../system/User.ts";

@NodeRegistry.register("page", {
  displayName: "Page",
  icon: "📄",
  description: "Website pages with customizable content"
}, [
  {
    name: "slug",
    type: "slug",
    label: "URL Slug",
    description: "The URL-friendly identifier for this page (e.g., 'about-us')",
    placeholder: "about-us",
    defaultValue: "",
    validation: {
      required: true,
      pattern: "^[a-z0-9-]+$",
      minLength: 1,
      maxLength: 100
    },
    ui: {
      width: "half",
      order: 1
    },
    save: (_, v: string) => v.trim().toLowerCase(),
  },
  {
    name: "title",
    type: "text",
    label: "Page Title",
    description: "The main title that will appear in the browser and on the page",
    placeholder: "Enter page title...",
    defaultValue: "",
    validation: {
      required: true,
      minLength: 1,
      maxLength: 200
    },
    ui: {
      width: "half",
      order: 2
    }
  },
  {
    type: "blocks",
    name: "content",
    label: "Page Content",
    description: "Blocks that compose the main content of the page",
    placeholder: "Enter page content using Markdown...",
    ui: {
      width: "full",
      order: 3
    },
    save: (_, v: string) => JSON.stringify(v),
    load: (page) => {
      try {
        return JSON.parse(page.content);
      } catch {
        return [];
      }
    }
  }
])
export default class Page extends Model {
  declare id: number;

  declare slug?: string;

  /**
   * Title of the page
   */
  declare title: string;
  
  /**
   * Markdown content of the page
   */
  declare content: string;

  /**
   * Author user ID
   */
  declare authorId?: number;

  declare readonly User: User;

  declare createdAt: Date;
  declare updatedAt: Date;
}

Page.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pages',
  }
);