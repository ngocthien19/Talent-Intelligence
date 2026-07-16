import pool from '~/config/db'

const categoryModel = {
  // Lấy tất cả category (chỉ lấy active)
  getAllCategories: async () => {
    const result = await pool.query(
      `SELECT id, name, slug, description, is_active, created_at, updated_at
       FROM category_job
       WHERE is_active = true
       ORDER BY name ASC`
    )
    return result.rows
  },

  // Lấy category theo slug
  getCategoryBySlug: async (slug) => {
    const result = await pool.query(
      `SELECT id, name, slug, description, is_active, created_at, updated_at
       FROM category_job
       WHERE slug = $1 AND is_active = true`,
      [slug]
    )
    return result.rows[0]
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    const result = await pool.query(
      `SELECT id, name, slug, description, is_active, created_at, updated_at
       FROM category_job
       WHERE id = $1 AND is_active = true`,
      [id]
    )
    return result.rows[0]
  }
}

export default categoryModel