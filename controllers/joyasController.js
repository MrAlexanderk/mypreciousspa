import pool from '../db/config.js';
import format from 'pg-format';

const prepararHATEOAS = (joyas, page, limits, total, order_by) => {
  return {
    total,
    results: joyas.map(j => ({
      name: j.nombre,
      href: `/joyas/${j.id}`
    })),
    links: {
      self: `/joyas?limits=${limits}&page=${page}&order_by=${order_by}`,
      next: page * limits < total ? `/joyas?limits=${limits}&page=${parseInt(page) + 1}&order_by=${order_by}` : null,
      prev: page > 1 ? `/joyas?limits=${limits}&page=${parseInt(page) - 1}&order_by=${order_by}` : null
    }
  };
};

export const getJoyas = async (req, res) => {
  try {
    let { limits = 3, page = 1, order_by = "id_ASC" } = req.query;
    limits = parseInt(limits);
    page = parseInt(page);
    const offset = (page - 1) * limits;
    const [campo, direccion] = order_by.split("_");

    const totalQuery = await pool.query("SELECT COUNT(*) FROM inventario");
    const total = parseInt(totalQuery.rows[0].count);

    const query = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s',
      campo, direccion, limits, offset);

    const { rows } = await pool.query(query);

    const hateoas = prepararHATEOAS(rows, page, limits, total, order_by);
    res.json(hateoas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener joyas' });
  }
};

export const getJoyasFiltradas = async (req, res) => {
  try {
    const { precio_min = 0, precio_max = 9999999, categoria, metal } = req.query;
    const filtros = [];
    const valores = [];

    const agregarFiltro = (campo, comparador, valor) => {
      valores.push(valor);
      filtros.push(`${campo} ${comparador} $${valores.length}`);
    };

    if (precio_min) agregarFiltro('precio', '>=', precio_min);
    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);

    let query = "SELECT * FROM inventario";
    if (filtros.length > 0) {
      query += ` WHERE ${filtros.join(' AND ')}`;
    }

    const { rows } = await pool.query(query, valores);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al filtrar joyas' });
  }
};
