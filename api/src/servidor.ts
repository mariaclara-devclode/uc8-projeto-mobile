import express from "express";
import cors from "cors";
import { pool } from "./banco.js";

const app = express();

app.use(cors());
app.use(express.json());

/* ROTA INICIAL */

app.get("/", (_req, res) => {
  res.json({
    mensagem: "API do ESTOK funcionando.",
  });
});

/* TESTE DO BANCO */

app.get("/teste-banco", async (_req, res) => {
  try {
    const resultado = await pool.query("SELECT NOW() AS agora");

    res.json({
      conectado: true,
      banco: "PostgreSQL / Neon",
      agora: resultado.rows[0].agora,
    });
  } catch (erro) {
    console.error("Erro ao conectar ao banco:", erro);

    res.status(500).json({
      conectado: false,
      mensagem: "Não foi possível conectar ao banco.",
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
});

/* LISTAR PRODUTOs*/

app.get("/produtos", async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        id,
        nome,
        codigo_barras,
        preco_venda,
        id_categoria,
        ativo
      FROM produtos
      ORDER BY id;
    `);

    const produtos = resultado.rows.map((produto) => ({
      id: Number(produto.id),
      nome: produto.nome,
      codigo_barras: produto.codigo_barras,
      preco_venda: Number(produto.preco_venda),
      id_categoria: Number(produto.id_categoria),
      ativo: Boolean(produto.ativo),
    }));

    res.status(200).json(produtos);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);

    res.status(500).json({
      mensagem: "Não foi possível buscar os produtos.",
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
});

/* BUSCAR PRODUTO POR ID */

app.get("/produtos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "O ID do produto é inválido.",
      });
    }

    const resultado = await pool.query(
      `
      SELECT
        id,
        nome,
        codigo_barras,
        preco_venda,
        id_categoria,
        ativo
      FROM produtos
      WHERE id = $1;
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const produto = resultado.rows[0];

    res.status(200).json({
      id: Number(produto.id),
      nome: produto.nome,
      codigo_barras: produto.codigo_barras,
      preco_venda: Number(
        produto.preco_venda
      ),
      id_categoria: Number(
        produto.id_categoria
      ),
      ativo: Boolean(produto.ativo),
    });
  } catch (erro) {
    console.error(
      "Erro ao buscar produto:",
      erro
    );

    res.status(500).json({
      mensagem:
        "Não foi possível buscar o produto.",
      erro:
        erro instanceof Error
          ? erro.message
          : String(erro),
    });
  }
});

/* CADASTRAR PRODUTO */

app.post("/produtos", async (req, res) => {
  try {
    const { nome, codigo_barras, preco_venda, id_categoria, ativo } = req.body;

    if (typeof nome !== "string" || nome.trim() === "") {
      return res.status(400).json({
        mensagem: "O nome do produto é obrigatório.",
      });
    }

    if (typeof codigo_barras !== "string" || codigo_barras.trim() === "") {
      return res.status(400).json({
        mensagem: "O código de barras é obrigatório.",
      });
    }

    const preco = Number(preco_venda);
    const categoria = Number(id_categoria);

    if (!Number.isFinite(preco) || preco <= 0) {
      return res.status(400).json({
        mensagem: "O preço do produto é inválido.",
      });
    }

    if (!Number.isInteger(categoria) || categoria <= 0) {
      return res.status(400).json({
        mensagem: "A categoria do produto é inválida.",
      });
    }

    const resultado = await pool.query(
      `
      INSERT INTO produtos (
        nome,
        codigo_barras,
        preco_venda,
        id_categoria,
        ativo
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        nome,
        codigo_barras,
        preco_venda,
        id_categoria,
        ativo;
      `,
      [nome.trim(), codigo_barras.trim(), preco, categoria, ativo ?? true],
    );

    const produto = resultado.rows[0];

    res.status(201).json({
      id: Number(produto.id),
      nome: produto.nome,
      codigo_barras: produto.codigo_barras,
      preco_venda: Number(produto.preco_venda),
      id_categoria: Number(produto.id_categoria),
      ativo: Boolean(produto.ativo),
    });
  } catch (erro) {
    console.error("ERRO AO CADASTRAR PRODUTO:", erro);

    res.status(500).json({
      mensagem: "Não foi possível cadastrar o produto.",
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
});

/* SERVIDOR*/

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API do ESTOK rodando na porta ${PORT}`);
});
