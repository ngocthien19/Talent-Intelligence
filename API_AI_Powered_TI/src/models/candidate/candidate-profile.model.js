import pool from '~/config/db'

const candidateProfileModel = {
  // Tạo profile mới
  create: async (data) => {
    const {
      user_id,
      name,
      email,
      phone,
      address,
      avatar,
      cv_text,
      cv_url,
      cv_original_name,
      cv_file_size,
      cv_mime_type,
      parsed_data,
      skills,
      job_preferences,
      expected_salary,
      available_from
    } = data

    const query = `
      INSERT INTO candidate_profiles (
        user_id, name, email, phone, address, avatar,
        cv_text, cv_url, cv_original_name, cv_file_size,
        cv_mime_type, parsed_data, skills, job_preferences,
        expected_salary, available_from
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `

    const result = await pool.query(query, [
      user_id,
      name,
      email,
      phone || '',
      address || '',
      avatar || null,
      cv_text || '',
      cv_url || '',
      cv_original_name || '',
      cv_file_size || 0,
      cv_mime_type || '',
      parsed_data || null,
      skills || [],
      job_preferences || null,
      expected_salary || null,
      available_from || null
    ])

    return result.rows[0]
  },

  // Lấy profile theo user_id
  findByUserId: async (userId) => {
    const result = await pool.query(
      'SELECT * FROM candidate_profiles WHERE user_id = $1',
      [userId]
    )
    return result.rows[0]
  },

  // Lấy profile theo id
  findById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM candidate_profiles WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  // Cập nhật profile
  update: async (id, data) => {
    const updates = []
    const values = []
    let paramIndex = 1

    const fields = ['name', 'phone', 'address', 'avatar', 'cv_text', 'cv_url',
      'cv_original_name', 'cv_file_size', 'cv_mime_type', 'parsed_data',
      'skills', 'job_preferences', 'expected_salary', 'available_from']

    // Lấy profile hiện tại để biết user_id
    const currentProfile = await candidateProfileModel.findById(id)
    if (!currentProfile) {
      throw new Error('Không tìm thấy hồ sơ')
    }

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`)
        values.push(data[field])
        paramIndex++
      }
    }

    if (updates.length === 0) {
      return await candidateProfileModel.findById(id)
    }

    values.push(id)
    const query = `
    UPDATE candidate_profiles 
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `

    const result = await pool.query(query, values)
    const updatedProfile = result.rows[0]

    if (data.avatar !== undefined) {
      await pool.query(
        `UPDATE users 
       SET avatar = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
        [data.avatar, currentProfile.user_id]
      )
    }

    if (data.name !== undefined) {
      await pool.query(
        `UPDATE users 
       SET fullname = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
        [data.name, currentProfile.user_id]
      )
    }

    return updatedProfile
  },

  // Get or create profile
  getOrCreate: async (userId, userData = {}) => {
    let profile = await candidateProfileModel.findByUserId(userId)

    if (!profile) {
      const avatar = userData.avatar || null

      profile = await candidateProfileModel.create({
        user_id: userId,
        name: userData.fullname || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        avatar: avatar
      })
    }

    return profile
  }
}

export default candidateProfileModel