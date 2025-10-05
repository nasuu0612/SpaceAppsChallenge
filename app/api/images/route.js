import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public/image");
  const files = fs.readdirSync(dir); // フォルダ内のファイル一覧を取得
  return new Response(JSON.stringify(files), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
