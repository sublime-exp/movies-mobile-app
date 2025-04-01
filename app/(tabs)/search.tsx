import {ActivityIndicator, FlatList, Image, Text, View} from 'react-native'
import {images} from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {useCallback, useEffect, useRef, useState} from "react";
import {updateSearchCount} from "@/services/appwrite";

const Search = () => {

    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [moviesData, setMoviesData] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    // Latest movies with pagination
    const fetchMoviesPaginated = useCallback(
        () => fetchMovies({query: searchQuery, page}),
        [page, searchQuery]
    );

    const {
        data: movies,
        loading,
        error,
        reload: loadMovies,
        reset
    } = useFetch(fetchMoviesPaginated, false);

    const isEndReached = useRef(false);

    const handleEndReached = useCallback(() => {
        if (!loading && hasMore && !isEndReached.current && moviesData?.length > 0) {
            isEndReached.current = true;
            setPage(prev => prev + 1);
        }
    }, [loading, hasMore, moviesData?.length]);

    useEffect(() => {
        if (!loading) {
            isEndReached.current = false;
        }
    }, [loading]);

    // Trigger fetches when page changes
    useEffect(() => {
        loadMovies();
    }, [page]);

    // Handle data updates
    useEffect(() => {
        if (movies?.results) {
            setMoviesData(prev => [
                ...(page === 1 ? [] : prev),
                ...movies.results
            ]);

            setHasMore(movies.page < movies.total_pages);
        }
    }, [movies]);

    const handleSearch = (text: string) => {
        setPage(1)
        setSearchQuery(text);
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        if (page === 1
            && searchQuery.trim()
            && movies
            && movies?.results?.length! > 0
            && movies?.results?.[0]) {
            updateSearchCount(searchQuery, movies.results[0]);
        }
    }, [movies]);

    // @ts-ignore
    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg}
                   className="flex-1 absolute w-full z-0"
                   resizeMode="cover"/>

            <FlatList data={moviesData}
                      renderItem={({item}) => <MovieCard {...item} />}
                      keyExtractor={(item) => item.id.toString()}
                      className="px-5"
                      numColumns={3}
                      columnWrapperStyle={{
                          justifyContent: "center",
                          gap: 16,
                          marginVertical: 16
                      }}
                      contentContainerStyle={{
                          paddingBottom: 100
                      }}
                      ListHeaderComponent={
                          <>
                              <View className="w-full flex-row justify-center mt-20 items-center">
                                  <Image source={icons.logo} className="w-12 h-10"/>
                              </View>
                              <View className="my-5">
                                  <SearchBar
                                      placeholder="Search movies..."
                                      value={searchQuery}
                                      onChangeText={handleSearch}
                                  />
                              </View>

                              {loading && (
                                  <ActivityIndicator size="large" color="#0000ff" className="my-3"/>
                              )}

                              {error && (
                                  <Text className="text-red-500 px-5 my-3">
                                      Error: {error.message}
                                  </Text>
                              )}

                              {!loading && !error && searchQuery.trim() && movies?.results?.length! > 0
                                  && (
                                      <Text className="text-xl text-white font-bold">
                                          Search Results for{" "}
                                          <Text className="text-accent">{searchQuery}</Text>
                                      </Text>
                                  )}
                          </>
                      }
                      ListEmptyComponent={
                          !loading && !error ? (
                              <View className="mt-10 px-5">
                                  <Text className="text-center text-gray-500">
                                      {searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
                                  </Text>
                              </View>
                          ) : null
                      }
                      onEndReached={handleEndReached}
                      onEndReachedThreshold={0.3}
                      scrollEnabled={true}
                      showsVerticalScrollIndicator={false}
            />
        </View>
    )
}
export default Search