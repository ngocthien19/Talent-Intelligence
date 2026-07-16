import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFavorites,
  toggleFavorite,
  checkFavorite,
  clearFavorites,
  updateFavoriteStatus
} from '~/redux/slices/favorite.slice'

export const useFavorite = () => {
  const dispatch = useDispatch()
  const { favorites, favoriteIds, isLoading, error, total, totalPages } = useSelector(
    (state) => state.favorite
  )

  const fetchFavorites = async (params = {}) => {
    await dispatch(getFavorites(params)).unwrap()
  }

  const toggle = async (jobId) => {
    const result = await dispatch(toggleFavorite(jobId)).unwrap()
    return result
  }

  const check = async (jobId) => {
    const result = await dispatch(checkFavorite(jobId)).unwrap()
    return result.isFavorite
  }

  const clear = async () => {
    await dispatch(clearFavorites()).unwrap()
  }

  const isFavorite = (jobId) => {
    return favoriteIds.includes(jobId)
  }

  const updateStatus = (jobId, isFav) => {
    dispatch(updateFavoriteStatus({ jobId, isFavorite: isFav }))
  }

  return {
    favorites,
    favoriteIds,
    isLoading,
    error,
    total,
    totalPages,
    fetchFavorites,
    toggle,
    check,
    clear,
    isFavorite,
    updateStatus
  }
}