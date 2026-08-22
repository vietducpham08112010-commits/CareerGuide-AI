const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /for \(const candidateKey of keysList\) \{[\s\S]*?\/\/ Return standard 500 error if all keys fail or no keys present\n  return res\.status\(500\)\.json\(\{ error: "Lỗi kết nối AI: Không thể truy cập mô hình \(Vui lòng kiểm tra API Key\)\." \}\);\n\}\);/,
  `let lastError: any = null;
  for (const candidateKey of keysList) {
    try {
      const aiInstance = new GoogleGenAI({ 
        apiKey: candidateKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await generateContentWithFallback(aiInstance, {
          contents,
          systemInstruction: systemInstruction || "You are an expert career counselor. Do not use asterisks (*) in text formatting."
      });

      if (response && response.text) {
        return res.json({ text: response.text });
      }
    } catch (error: any) {
      lastError = error;
      console.warn(\`Key candidate failed for chat, trying next:\`, error?.message || error);
    }
  }

  const errorMessage = lastError?.message || "Lỗi kết nối AI: Không thể truy cập mô hình (Vui lòng kiểm tra API Key).";
  return res.status(500).json({ error: errorMessage });
});`
);

fs.writeFileSync('server.ts', code);
