/**
 * @author 柳博文
 * @create 2026-11-13
 * @model DeepSeek-V4.1-Flash
 * @description 诗词数据服务器：端口 3004，提供 /api/poems 接口，并静态托管项目根目录（HTML、图片等）
 *
 * 启动方式：node db/server.js
 * 访问地址：http://127.0.0.1:3004/poems-gallery.html
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

// 服务端口
const lbw_port = 3004;
// 项目根目录：db 的上一级，静态文件都从这里取
const lbw_root = path.resolve(__dirname, "..");
// 数据文件路径
const lbw_dbFile = path.join(__dirname, "db.json");

// 常见扩展名对应的 Content-Type
const lbw_mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

/**
 * 读取 db.json 里的 poems 数组
 * @returns {Array} 诗词列表，读取或解析失败时返回空数组
 */
function lbw_readPoems() {
  try {
    const lbw_text = fs.readFileSync(lbw_dbFile, "utf8");
    const lbw_data = JSON.parse(lbw_text);
    return Array.isArray(lbw_data.poems) ? lbw_data.poems : [];
  } catch (lbw_err) {
    console.error("读取 db.json 失败：", lbw_err.message);
    return [];
  }
}

/**
 * 返回 JSON 响应，并允许跨域访问
 * @param {http.ServerResponse} lbw_res 响应对象
 * @param {number} lbw_code HTTP 状态码
 * @param {Object} lbw_data 要返回的数据
 */
function lbw_sendJson(lbw_res, lbw_code, lbw_data) {
  const lbw_body = JSON.stringify(lbw_data);
  lbw_res.writeHead(lbw_code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(lbw_body),
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store"
  });
  lbw_res.end(lbw_body);
}

/**
 * 按 URL 路径返回静态文件，找不到时返回 404
 * @param {http.IncomingMessage} lbw_req 请求对象
 * @param {http.ServerResponse} lbw_res 响应对象
 * @param {string} lbw_pathname 解码后的 URL 路径
 */
function lbw_serveStatic(lbw_req, lbw_res, lbw_pathname) {
  // 目录请求默认返回 index.html
  const lbw_relPath = lbw_pathname === "/" ? "/index.html" : lbw_pathname;
  const lbw_filePath = path.join(lbw_root, lbw_relPath);

  // 防止用 ../ 跳出项目根目录
  if (!lbw_filePath.startsWith(lbw_root)) {
    lbw_res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    lbw_res.end("403 Forbidden");
    return;
  }

  fs.readFile(lbw_filePath, function (lbw_err, lbw_content) {
    if (lbw_err) {
      lbw_res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      lbw_res.end("404 Not Found：" + lbw_pathname);
      return;
    }
    const lbw_ext = path.extname(lbw_filePath).toLowerCase();
    lbw_res.writeHead(200, {
      "Content-Type": lbw_mime[lbw_ext] || "application/octet-stream",
      "Content-Length": lbw_content.length
    });
    lbw_res.end(lbw_content);
  });
}

/**
 * 请求总入口：/api/poems 返回诗词数据，其余路径走静态文件
 * @param {http.IncomingMessage} lbw_req 请求对象
 * @param {http.ServerResponse} lbw_res 响应对象
 */
function lbw_handleRequest(lbw_req, lbw_res) {
  const lbw_pathname = decodeURIComponent(lbw_req.url.split("?")[0]);

  if (lbw_pathname === "/api/poems") {
    lbw_sendJson(lbw_res, 200, { poems: lbw_readPoems() });
    return;
  }

  lbw_serveStatic(lbw_req, lbw_res, lbw_pathname);
}

http.createServer(lbw_handleRequest).listen(lbw_port, function () {
  console.log("数据服务器已启动：http://127.0.0.1:" + lbw_port + "/poems-gallery.html");
  console.log("接口地址：http://127.0.0.1:" + lbw_port + "/api/poems");
});
