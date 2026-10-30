
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Tradutor de chamadas"
  });
});

app.post("/translate", async (req, res) => {
  const { q, source, target } = req.body || {};

  if (!q || !source || !target) {
    return res.status(400).json({
      error: "Indica o texto e os idiomas."
    });
  }

  if (Buffer.byteLength(q, "utf8") > 500) {
    return res.status(400).json({
      error: "O texto deve ter no máximo 500 bytes."
    });
  }

  try {
    const params = new URLSearchParams({
      q: q,
      langpair: `${source}|${target}`
    });

    const response = await fetch(
      `https://api.mymemory.translated.net/get?${params}`
    );

    if (!response.ok) {
      throw new Error("Erro no serviço de tradução.");
    }

    const data = await response.json();

    if (
      data.responseStatus !== 200 ||
      !data.responseData ||
      !data.responseData.translatedText
    ) {
      return res.status(502).json({
        error: "Não foi possível traduzir este texto."
      });
    }

    res.json({
      translatedText: data.responseData.translatedText
    });

  } catch (error) {
    res.status(500).json({
      error: "Erro ao ligar ao serviço de tradução."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ativo na porta ${PORT}`);
});
