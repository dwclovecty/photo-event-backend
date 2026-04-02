import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegPath);

export const mergeVideos = (videoPaths, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    videoPaths.forEach((video) => {
      command.input(video);
    });

    command
      .complexFilter([
        {
          filter: "concat",
          options: {
            n: videoPaths.length,
            v: 1,
            a: 0,
          },
        },
      ])
      .outputOptions("-movflags frag_keyframe+empty_moov")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};
