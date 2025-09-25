import { DataTypes } from "sequelize";
import { DBMigration } from "../migration.ts";

export default new DBMigration({
  async up(queryInterface) {
    await queryInterface.createTable('files', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false
      },
      size: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false
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

    // Add indexes for better performance
    await queryInterface.addIndex('files', ['mimeType']);
    await queryInterface.addIndex('files', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('files');
  }
})