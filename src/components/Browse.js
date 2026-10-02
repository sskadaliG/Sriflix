import Header from './Header';
import useNowPlayingMovies from '../hooks/useNowPlayingMovies';
import MainContainer from './MainContainer';
import SecondaryContainer from './SecondaryContainer';
import AiSearch from './AiSearch';
import Footer from './Footer';
import MovieModal from './MovieModal';
import { useSelector } from 'react-redux';


const Browse = () => {

  useNowPlayingMovies();

  const aiSearch = useSelector((store) => store.ai.showAiSearch);

  return (
    <div>
      <Header />
      {aiSearch ? <AiSearch /> :
        <>
          <MainContainer />
          <SecondaryContainer /></>
      }
      <Footer />
      <MovieModal />

    </div>

  )
}

export default Browse