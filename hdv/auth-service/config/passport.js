require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../models');

module.exports = function(passport) {
    const callbackBaseURL = process.env.CALLBACK_BASE_URL || 'http://localhost:3000';
    
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${callbackBaseURL}/api/auth/google/callback`
    }, async (token, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const googleId = profile.id;
            let user = await User.findOne({ where: { googleId } });
            if (!user) {
                user = await User.findOne({ where: { email } });
                if (user) { user.googleId = googleId; await user.save(); }
                else {
                    user = await User.create({ googleId, email, username: profile.displayName });
                }
            }
            return done(null, user);
        } catch (err) { return done(err, false); }
    }));

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${callbackBaseURL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails']
    }, async (token, refreshToken, profile, done) => {
        try {
            const email = profile.emails ? profile.emails[0].value : null;
            const facebookId = profile.id;
            let user = await User.findOne({ where: { facebookId } });
            if (!user && email) {
                user = await User.findOne({ where: { email } });
                if (user) { user.facebookId = facebookId; await user.save(); }
                else {
                    user = await User.create({ facebookId, email, username: profile.displayName });
                }
            } else if (!user) {
                 user = await User.create({ facebookId, email: `fb_${facebookId}@no-email.com`, username: profile.displayName });
            }
            return done(null, user);
        } catch (err) { return done(err, false); }
    }));
};