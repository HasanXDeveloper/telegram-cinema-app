import { useQuery } from 'react-query'
import { api } from '../services/api'

export const useMovies = (category = 'popular', page = 1) => {
  return useQuery(
    ['movies', category, page],
    () => api.getMovies(category, page),
    {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
    }
  )
}

export const useMovie = (id) => {
  return useQuery(
    ['movie', id],
    () => api.getMovie(id),
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 минут
    }
  )
}

export const useSearchMovies = (query) => {
  return useQuery(
    ['search', query],
    () => api.searchMovies(query),
    {
      enabled: !!query && query.length > 2,
      staleTime: 5 * 60 * 1000,
    }
  )
}