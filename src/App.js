import { useRef, useState } from "react";
import { useEffect } from "react";
import StarRating from "./StarsRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKeyboard } from "./useKeyboard";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => +(acc + cur / arr.length).toFixed(1), 0);
const KEY = "5b079ac1";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  // const query = "interstellar";

  function handleSelectedId(id) {
    // set id AMD conditionaly reset if click again on already selected movie
    setSelectedId(id === selectedId ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleSetWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    // localStorage.setItem(
    //   "watched",
    //   JSON.stringify(watched.filter((movie) => movie.imdbID !== id))
    // );
  }

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <SearchRes movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MoviesList movies={movies} onSelectedId={handleSelectedId} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onSetWatched={handleSetWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onSelectedId={handleSelectedId}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loading() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  // initialize useRef
  const inputEl = useRef(null);

  useKeyboard("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      // telling that ref to this element in our variable
      ref={inputEl}
    />
  );
}

function SearchRes({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({ movies, onSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectedId={onSelectedId} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectedId }) {
  return (
    <li onClick={() => onSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesList({ watched, onSelectedId, onDeleteWatched }) {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onSelectedId={onSelectedId}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onSetWatched, watched }) {
  const [movieInfo, setMovieInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // Adding derived state
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  // console.log(isWatched);

  // destructuring the object
  const {
    Title: title,
    Year: year,
    Released: released,
    Runtime: runtime,
    Poster: poster,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieInfo;

  function handleWathcedAdd() {
    const newWathcedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: runtime.split(" ").at(0),
      userRating,
    };
    // console.log(newWathcedMovie);
    onSetWatched(newWathcedMovie);
    // also clsoe on add watched
    onCloseMovie();
  }

  // we need useEffect because we want to display info about movie already at mount of the component
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res =
          await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}
  `);
        const data = await res.json();
        // console.log(data);
        setMovieInfo(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  // changing page title
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      // cleanup func
      return function () {
        document.title = "usePopcorn";
      };
    },
    [title]
  );

  useKeyboard("Escape", onCloseMovie);

  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️ IMDB:</span>
                {imdbRating}
              </p>
              {watchedUserRating && (
                <p>
                  <span>🌟 Your rating:</span>
                  {watchedUserRating}
                </p>
              )}
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    defaultRating={0}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleWathcedAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>{`You already rated this movie with ${watchedUserRating} 🌟`}</p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Main starts: {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMovie({ movie, onSelectedId, onDeleteWatched }) {
  return (
    <li>
      <div onClick={() => onSelectedId(movie.imdbID)}>
        <img src={movie.poster} alt={`${movie.title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.userRating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
        </div>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDeleteWatched(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => +movie.imdbRating).filter((rating) => !isNaN(rating))
  );
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched.map((movie) => +movie?.runtime).filter((runtime) => !isNaN(runtime))
  );

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
