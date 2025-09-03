import Header from './Header';
import useNowPlayingMovies from '../hooks/useNowPlayingMovies';
import MainContainer from './MainContainer';
import SecondaryContainer from './SecondaryContainer';
import GptSearch from './GptSearch';
import { useSelector } from 'react-redux';


const Browse = () => {

  useNowPlayingMovies();

  const gptSearch = useSelector((store) => store.gpt.showGptSearch);

  return (
    <div>
      <Header />
      {gptSearch ? <GptSearch /> :
        <>
          <MainContainer />
          <SecondaryContainer /></>
      }

    </div>

  )
}

export default Browse