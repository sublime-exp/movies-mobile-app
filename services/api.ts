export const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    }
}

export const fetchMovies = async ({query, page = 1}: { query: string; page?: number; }) => {
    page = page || 1

    const endpoint = query
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;


    const response = await fetch(endpoint, {
        method: "GET",
        headers: TMDB_CONFIG.headers
    })

    console.log('GET: ' + endpoint)

    if (!response.ok) {
        // @ts-ignore
        throw new Error(response.status)
    }
    const data = await response.json();
    return data;
}

export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
            {
                method: "GET",
                headers: TMDB_CONFIG.headers
            }
        )

        if (!response.ok) throw new Error('Failed to fetch movie details')

        return await response.json();

    } catch (error) {
        console.log(error);
        throw error;
    }
}