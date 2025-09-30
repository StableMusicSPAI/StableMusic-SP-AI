import formidable from "formidable";
import fs from "fs";
import { transcodeAudio } from "../../lib/ffmpeg";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const file = files.audio[0];
    const output = `/tmp/${Date.now()}.mp3`;
    await transcodeAudio(file.filepath, output);
    res.json({ url: `/uploads/${output}` });
  });
}