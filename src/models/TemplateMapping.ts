import mongoose, { Schema } from "mongoose";

const templateMappingSchema = new Schema(
  {
    spreadsheetId: {
      type: Schema.Types.ObjectId,
      ref: "Spreadsheet",
      required: true,
    },

    mappings: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "TemplateMapping",
  templateMappingSchema
);