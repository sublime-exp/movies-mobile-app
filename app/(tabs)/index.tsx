import {ActivityIndicator, FlatList, Image, Text, View,} from "react-native";
import {images} from "@/constants/images";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import {useRouter} from "expo-router";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import {getTrendingMovies} from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";
import {useCallback, useEffect, useState} from "react";


export default function Index() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [moviesData, setMoviesData] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    // Trending movies
    const {
        data: trendingMovies,
        loading: trendingLoading,
        error: trendingError
    } = useFetch(getTrendingMovies);

    // Latest movies with pagination
    const fetchMoviesPaginated = useCallback(
        () => fetchMovies({query: "", page}),
        [page]
    );

    const {
        data: movies,
        loading: moviesLoading,
        error: moviesError,
        reload
    } = useFetch(fetchMoviesPaginated, false);


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


    // Trigger fetches when page changes
    useEffect(() => {
        reload();
    }, [page]);

    // Infinite scroll handler
    const handleEndReached = () => {
        if (hasMore && !moviesLoading) {
            setPage(prev => prev + 1);
        }
    };

    // @ts-ignore
    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />

            <FlatList
                className="px-5"
                data={[]} // Empty data array since we're using ListHeaderComponent
                renderItem={null}
                keyExtractor={() => "main-scroll"}
                ListHeaderComponent={
                    <>
                        <Image
                            source={icons.logo}
                            className="w-12 h-10 mt-20 mb-5 mx-auto"
                        />

                        {(moviesLoading && page === 1) || trendingLoading ? (
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                                className="mt-10 self-center"
                            />
                        ) : moviesError || trendingError ? (
                            <Text>Error: {moviesError?.message || trendingError?.message}</Text>
                        ) : (
                            <View className="flex-1 mt-5">
                                <SearchBar
                                    onPress={() => router.push("/search")}
                                    placeholder="Search for a movie"
                                />

                                {trendingMovies && (
                                    <View className="mt-10">
                                        <Text className="text-lg text-white font-bold mb-3">
                                            Trending Movies
                                        </Text>
                                        <FlatList
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            ItemSeparatorComponent={() => <View className="w-4"/>}
                                            className="mb-4 mt-3"
                                            data={trendingMovies}
                                            renderItem={({item, index}) => (
                                                <TrendingCard movie={item} index={index}/>
                                            )}
                                            keyExtractor={(item) => item.movie_id.toString()}
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                }
                ListFooterComponent={
                    <View className="pb-32">
                        <Text className="text-lg text-white font-bold mt-5 mb-3">
                            Latest Movies
                        </Text>

                        <FlatList
                            data={moviesData}
                            renderItem={({item}) => <MovieCard {...item} />}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={3}
                            columnWrapperStyle={{
                                justifyContent: "flex-start",
                                gap: 20,
                                paddingRight: 5,
                                marginBottom: 10
                            }}
                            scrollEnabled={true}
                        />

                        {moviesLoading && page > 1 && (
                            <ActivityIndicator
                                size="small"
                                color="#0000ff"
                                className="mt-5"
                            />
                        )}
                    </View>
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}