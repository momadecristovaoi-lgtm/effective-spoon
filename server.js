
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

  const baseUrl = process.env.LIBRETRANSLATE_URL;

  if (!baseUrl) {
    return res.status(503).json({
      error: "O serviço de tradução ainda não está configurado."
    });
  }

  try {
    const payload = {
      q,
      source,
      target,
      format: "text"
    };

    if (process.env.LIBRETRANSLATE_API_KEY) {
      payload.api_key = process.env.LIBRETRANSLATE_API_KEY;
    }

    const response = await fetch(
      baseUrl.replace(/\/+$/, "") + "/translate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "O serviço de tradução recusou o pedido."
      });
    }

    res.json({
      translatedText: data.translatedText
    });
  } catch (error) {
    res.status(502).json({
      error: "Não foi possível contactar o serviço de tradução."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor iniciado na porta " + PORT);
});

