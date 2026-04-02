import express from "express";
import cors from "cors";
import fs from "fs";
import { mergeVideos } from "./video.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "200mb" })); // ⭐影片一定要加大

// ===== 原本功能（保留）=====
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

// ===== 新增：影片合成 API =====
const TEMP_DIR = "./temp";
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

app.post("/merge-video", async (req, res) => {
  try {
    const { videos } = req.body;

    if (!videos || videos.length === 0) {
      return res.status(400).json({ error: "No videos" });
    }

    // 儲存影片
    const videoPaths = videos.map((base64, i) => {
      const filePath = `${TEMP_DIR}/input_${i}.webm`;
      const buffer = Buffer.from(base64.split(",")[1], "base64");
      fs.writeFileSync(filePath, buffer);
      return filePath;
    });

    const outputPath = `${TEMP_DIR}/output_${Date.now()}.mp4`;

    // 🎬 合成
    await mergeVideos(videoPaths, outputPath);

    // 回傳
    const fileBuffer = fs.readFileSync(outputPath);
    const base64Video = `data:video/mp4;base64,${fileBuffer.toString("base64")}`;

    res.json({ video: base64Video });

    // 🧹 清除
    videoPaths.forEach(p => fs.unlinkSync(p));
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error("影片合成失敗:", err);
    res.status(500).json({ error: "merge failed" });
  }
});

// ===== 啟動 =====
app.listen(process.env.PORT || 3000, () => {
  console.log("Photo Event Backend Running");
});
