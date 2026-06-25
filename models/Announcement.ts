import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  image?: string;
  ownerId: mongoose.Types.ObjectId;
  isGlobal: boolean;
  createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title:    { type: String, required: true },
    content:  { type: String, required: true },
    image:    { type: String },
    ownerId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    isGlobal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
export default Announcement;
