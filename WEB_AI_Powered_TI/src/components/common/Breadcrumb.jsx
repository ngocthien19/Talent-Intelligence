import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'

const Breadcrumb = ({ items, className = '' }) => {
  const { t } = useLanguage()

  return (
    <nav className={`mb-6 flex items-center gap-2 text-base text-brand-text/60 dark:text-black flex-wrap ${className}`}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.link ? (
            <Link
              to={item.link}
              className="hover:text-brand-primary dark:hover:text-brand-primary transition-colors cursor-pointer"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-primary dark:text-brand-primary font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumb