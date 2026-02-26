import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/config", (req, res) => {
  res.json({
    eventTitle: process.env.EVENT_TITLE || "PHOTO EVENT",
    eventSubtitle: process.env.EVENT_SUBTITLE || "Welcome",
    blessingTexts: [
      process.env.BLESSING_1 || "謝謝你留下今天的笑容。",
      process.env.BLESSING_2 || "願美好回憶常伴你左右。"
    ]
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Photo Event Backend Running");
});
