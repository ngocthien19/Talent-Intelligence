import { Link } from 'react-router-dom'
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const Footer = () => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    quickLinks: [
      { to: '/jobs', label: t('footer.jobs') },
      { to: '/companies', label: t('footer.companies') },
      { to: '/about', label: t('footer.about') },
      { to: '/contact', label: t('footer.contact') }
    ],
    candidateLinks: [
      { to: '/register', label: t('footer.createProfile') },
      { to: '/jobs', label: t('footer.findJobs') },
      { to: '/applications', label: t('footer.manageApplications') },
      { to: '/profile', label: t('footer.updateCV') }
    ]
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-brand-light dark:border-gray-700 transition-colors duration-300">
      <div className="app-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">JM</span>
              </div>
              <span className="text-xl font-bold text-brand-secondary dark:text-white">
                Job<span className="text-brand-primary">Mind</span>
              </span>
            </div>
            <p className="text-brand-text dark:text-gray-400 text-sm leading-relaxed">
              {t('footer.brandDesc')}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="p-2 rounded-lg bg-brand-bg dark:bg-gray-800 text-brand-text dark:text-gray-400 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-brand-bg dark:bg-gray-800 text-brand-text dark:text-gray-400 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-brand-bg dark:bg-gray-800 text-brand-text dark:text-gray-400 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-brand-bg dark:bg-gray-800 text-brand-text dark:text-gray-400 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200"
                aria-label="GitHub"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-brand-secondary dark:text-white mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-brand-text dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Candidates */}
          <div>
            <h3 className="font-semibold text-brand-secondary dark:text-white mb-4">
              {t('footer.forCandidates')}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.candidateLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-brand-text dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-brand-secondary dark:text-white mb-4">
              {t('footer.contactUs')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-brand-text dark:text-gray-400">
                <FaMapMarkerAlt className="text-brand-primary dark:text-brand-primary flex-shrink-0 mt-0.5" size={18} />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-brand-text dark:text-gray-400">
                <FaEnvelope className="text-brand-primary dark:text-brand-primary flex-shrink-0" size={18} />
                <a
                  href="mailto:contact@jobmind.com"
                  className="hover:text-brand-primary dark:hover:text-white transition-colors"
                >
                  contact@jobmind.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-brand-text dark:text-gray-400">
                <FaPhone className="text-brand-primary dark:text-brand-primary flex-shrink-0" size={18} />
                <a
                  href="tel:+84901234567"
                  className="hover:text-brand-primary dark:hover:text-white transition-colors"
                >
                  +84 90 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-light dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-brand-text dark:text-gray-400">
            &copy; {currentYear} JobMind Platform. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-brand-text dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/terms"
              className="text-brand-text dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors"
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer