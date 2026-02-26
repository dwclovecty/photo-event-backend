import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/config", (req, res) => {
  res.json({
    eventTitle: process.env.EVENT_TITLE || "WEDDING PHOTOBOOTH",
    eventSubtitle: process.env.EVENT_SUBTITLE || "今天，我們結婚了",
    blessingTexts: [
      process.env.BLESSING_1 || "謝謝你留下今天的笑容。",
      process.env.BLESSING_2 || "願美好回憶常伴你左右。"
    ]
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Photo Event Backend Running");
});
