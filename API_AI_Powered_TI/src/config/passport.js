import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './environment.js'
import authService from '~/services/auth/auth.service'

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {

        const userData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          fullname: profile.displayName,
          avatar: profile.photos?.[0]?.value
        }

        const result = await authService.googleLogin(userData)

        req.user = result.user
        req.tokens = result.tokens

        return done(null, result.user)
      } catch (error) {
        console.error('Google strategy error:', error)
        return done(error, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.getUserById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport