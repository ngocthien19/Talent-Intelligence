import { useAuth } from './useAuth'
import { useDispatch } from 'react-redux'
import { getFavorites } from '~/redux/slices/favorite.slice'

export const useFavorite = () => {
  const dispatch = useDispatch()
  const {
    favoriteIds,
    addFavorite,
    removeFavorite,
    isFavorite,
    syncFavoriteIds,
    setFavoritesFromApi
  } = useAuth()

  // Hàm fetch favorites từ API và đồng bộ
  const fetchAndSyncFavorites = async () => {
    try {
      const result = await dispatch(getFavorites()).unwrap()
      const ids = (result.data || []).map(fav => fav.job_id)
      setFavoritesFromApi(ids)
      return ids
    } catch (error) {
      console.error('Fetch favorites error:', error)
      return []
    }
  }

  return {
    favoriteIds,
    addFavorite,
    removeFavorite,
    isFavorite,
    syncFavoriteIds,
    setFavoritesFromApi,
    fetchAndSyncFavorites
  }
}