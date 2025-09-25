import { DataTypes } from "sequelize";
import { DBMigration } from "../migration.ts";

export default new DBMigration({
  async up(queryInterface) {
    await queryInterface.createTable('articles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('articles');
  }
});