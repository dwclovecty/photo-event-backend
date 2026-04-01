import express from "express";
import cors from "cors";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "200mb" }));

// ⭐ 提供影片存取
app.use(express.static("./"));

/**
 * 🔥 合成影片 API
 * POST /merge-video
 */
app.post("/merge-video", async (req, res) => {
  try {
    const { videos } = req.body;

    if (!videos || videos.length === 0) {
      return res.status(400).send("沒有影片");
    }

    // 1️⃣ 存檔
    const inputPaths = videos.map((base64, i) => {
      const filePath = `tmp_${Date.now()}_${i}.webm`;
      const data = base64.replace(/^data:video\/webm;base64,/, "");
      fs.writeFileSync(filePath, Buffer.from(data, "base64"));
      return filePath;
    });

    const outputPath = `output_${Date.now()}.mp4`;

    // 2️⃣ ffmpeg 合成（先做「上下拼」最穩）
    ffmpeg()
      .input(inputPaths[0])
      .input(inputPaths[1] || inputPaths[0])
      .complexFilter([
        "[0:v]scale=540:960[v0]",
        "[1:v]scale=540:960[v1]",
        "[v0][v1]vstack=inputs=2[out]"
      ])
      .outputOptions(["-map [out]"])
      .save(outputPath)
      .on("end", () => {

        // 3️⃣ 回傳影片 URL
        const videoUrl = `https://photo-event-backend.onrender.com/${outputPath}`;

        res.json({ videoUrl });

        // 🧹 清暫存（重要）
        inputPaths.forEach(p => fs.unlinkSync(p));

      })
      .on("error", (err) => {
        console.error("ffmpeg error:", err);
        res.status(500).send("影片合成失敗");
      });

  } catch (err) {
    console.error(err);
    res.status(500).send("伺服器錯誤");
  }
});

// 啟動
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🎬 Video server running on port", PORT);
});
