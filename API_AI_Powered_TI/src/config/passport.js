import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './environment'
import authService from '~/services/auth/auth.service'

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
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

        req.accessToken = result.tokens.accessToken
        req.refreshToken = result.tokens.refreshToken

        return done(null, result.user, {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken
        })
      } catch (error) {
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