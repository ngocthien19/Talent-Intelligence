import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-white dark:bg-gray-950">
      <h1 className="text-6xl font-bold text-brand-primary">404</h1>
      <p className="mt-2 text-lg text-brand-secondary dark:text-white">Không tìm thấy trang bạn yêu cầu</p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-gradient-brand text-white rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        Về trang chủ
      </Link>
    </div>
  )
}

export default NotFound