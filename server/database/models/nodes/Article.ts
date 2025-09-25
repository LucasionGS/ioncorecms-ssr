import { Model, DataTypes } from "sequelize";
import sequelize from "../../sequelize.ts";
import NodeRegistry from "../../../core/NodeRegistry.ts";
import User from "../system/User.ts";

@NodeRegistry.register("article", {
  displayName: "Article",
  icon: "📰",
  description: "Blog articles and news content",
  subpath: "blog"
}, [
  {
    name: "slug",
    type: "slug",
    label: "Article URL Slug",
    description: "The URL-friendly identifier for this article (e.g., 'my-first-blog-post')",
    placeholder: "my-article-title",
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
    save: (article, v: string) => article.slug = v.trim().toLowerCase(),
  },
  {
    name: "title",
    type: "text",
    label: "Article Title",
    description: "The main title that will appear in the browser and on the page",
    placeholder: "Enter article title...",
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
    type: "textarea",
    name: "excerpt",
    label: "Article Excerpt",
    description: "A brief summary of the article for previews",
    placeholder: "Enter a brief excerpt...",
    rows: 3,
    validation: {
      required: false,
      maxLength: 500
    },
    ui: {
      width: "full",
      order: 3
    }
  },
  {
    type: "textarea",
    name: "content",
    label: "Article Content",
    description: "The main content of the article (supports Markdown)",
    placeholder: "Enter article content using Markdown...",
    rows: 15,
    validation: {
      required: true,
      minLength: 50
    },
    ui: {
      width: "full",
      order: 4
    }
  }
])
export default class Article extends Model {
  declare id: number;

  declare slug?: string;

  /**
   * Title of the article
   */
  declare title: string;
  
  /**
   * Brief excerpt/summary of the article
   */
  declare excerpt?: string;
  
  /**
   * Markdown content of the article
   */
  declare content: string;

  /**
   * Author user ID
   */
  declare authorId?: number;

  declare readonly author: User;

  declare createdAt: Date;
  declare updatedAt: Date;
}

Article.init(
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
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  },
  {
    sequelize,
    tableName: 'articles',
    defaultScope: {
      include: [{ model: User, as: 'author', attributes: ['id', 'username' ] }]
    }
  }
);

Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });