import { useEffect, useState } from "react";

const KEY = "5b079ac1";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      // calling default browser API
      const controller = new AbortController();

      async function fetchMovie() {
        try {
          setIsLoading(true);
          // reseting the error
          setError("");
          // connectiong controller with fetch request (adding as second arg)
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}
            `,
            { signal: controller.signal }
          );
          // if connection lost
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");
          const data = await res.json();

          // if no movies by search query
          if (data.Response === "False") throw new Error("Movies not found");

          // if we get response with movies
          setMovies(data.Search);
          // console.log(data.Search);
          // needed because of cleanup
          // setError("");
        } catch (err) {
          // prevent controller Abort error from being counting/displayed as error
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      // early return if search query too short
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      // closing movieDetails when we start new search
      //   handleCloseMovie();
      // calling func
      fetchMovie();

      // creating cleanup
      return function () {
        controller.abort();
      };
    },
    // setting for dependencyArray
    [query]
  );

  return { movies, isLoading, error };
}
