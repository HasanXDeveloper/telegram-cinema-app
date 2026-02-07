import { useQuery } from 'react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const useMovie = (movieId) => {
  return useQuery(
    ['movie', movieId],
    async () => {
      const { data } = await axios.get(`${API_URL}/movies/${movieId}/`)
      return data
    },
    {
      enabled: !!movieId,
      staleTime: 5 * 60 * 1000, // 5 минут
    }
  )
}

export const useMovieStreams = (movieId) => {
  return useQuery(
    ['movie-streams', movieId],
    async () => {
      const { data } = await axios.get(`${API_URL}/movies/${movieId}/streams/`)
      return data
    },
    {
      enabled: !!movieId,
      staleTime: 10 * 60 * 1000, // 10 минут
    }
  )
}

export const useMovieReviews = (movieId, page = 1) => {
  return useQuery(
    ['movie-reviews', movieId, page],
    async () => {
      const { data } = await axios.get(`${API_URL}/movies/${movieId}/reviews/`, {
        params: { page }
      })
      return data
    },
    {
      enabled: !!movieId,
      staleTime: 2 * 60 * 1000, // 2 минуты
    }
  )
}

export const useSimilarMovies = (movieId) => {
  return useQuery(
    ['similar-movies', movieId],
    async () => {
      const { data } = await axios.get(`${API_URL}/movies/${movieId}/similar/`)
      return data
    },
    {
      enabled: !!movieId,
      staleTime: 30 * 60 * 1000, // 30 минут
    }
  )
}