import { Model, DataTypes } from "sequelize";
import sequelize from "../../sequelize.ts";

export default class File extends Model {
  declare id: number;
  declare filename: string;
  declare path: string;
  declare size: number;
  declare mimeType: string;
  
  declare createdAt: Date;
  declare updatedAt: Date;
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "files",
    sequelize
  }
);