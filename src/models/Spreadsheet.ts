import mongoose, { Schema } from "mongoose";

const spreadsheetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    spreadsheetId: {
      type: String,
      required: true,
    },

    worksheetName: {
      type: String,
      required: true, 
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Spreadsheet",
  spreadsheetSchema
);