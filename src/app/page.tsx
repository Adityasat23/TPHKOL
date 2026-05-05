'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const DEFAULT_AVATAR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";

export default function Home() {
  const [commentText, setCommentText] = useState("Ini Bigsale nya kapan");
  const [username, setUsername] = useState("sienna");
  const [replyTo, setReplyTo] = useState("creator");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  const previewRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const exportImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    try {
      // pastikan font & layout ready
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 200));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        width: element.offsetWidth,
        height: element.scrollHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = "tiktok-comment.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      alert("Export gagal");
    }
  };

  if (!isReady) return null;

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      
      {/* INPUT */}
      <div style={{ marginBottom: 30 }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <br /><br />
        <input
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="Reply to"
        />
        <br /><br />
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={3}
          style={{ width: 300 }}
        />
        <br /><br />
        <button onClick={exportImage}>Export PNG</button>
      </div>

      {/* PREVIEW AREA */}
      <div
        style={{
          background: "#0f172a",
          padding: 40,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          ref={previewRef}
          style={{
            width: 600, // 🔥 FIX WIDTH (INI KUNCI)
            padding: "30px 30px 60px 30px",
          }}
        >
          {/* STICKER */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                background: "#fff",
                borderRadius: "16px 16px 16px 0px",
                padding: "16px 20px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                width: "100%", // 🔥 FIX
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={avatar}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: "#8a8b91",
                    fontSize: 14,
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  Reply to {replyTo}'s comment
                </p>

                <p
                  style={{
                    color: "#000",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginTop: 4,
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {commentText}
                </p>
              </div>
            </div>

            {/* TAIL */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{
                position: "absolute",
                bottom: -14,
                left: 0,
              }}
            >
              <polygon points="0,0 16,0 0,16" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}