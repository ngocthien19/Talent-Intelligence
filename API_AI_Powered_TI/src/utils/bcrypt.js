import bcrypt from 'bcryptjs'

const saltRounds = 10

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message)
  }
}

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    throw new Error('Error comparing password: ' + error.message)
  }
}

export const hashPasswordSync = (password) => {
  try {
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message)
  }
}

export const comparePasswordSync = (password, hashedPassword) => {
  try {
    return bcrypt.compareSync(password, hashedPassword)
  } catch (error) {
    throw new Error('Error comparing password: ' + error.message)
  }
}

export const generateSalt = (rounds = saltRounds) => {
  return bcrypt.genSaltSync(rounds)
}

export default {
  hashPassword,
  comparePassword,
  hashPasswordSync,
  comparePasswordSync,
  generateSalt
}