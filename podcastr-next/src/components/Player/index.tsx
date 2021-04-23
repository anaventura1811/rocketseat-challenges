
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import {useState} from 'react';

import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export default function Player() {

  const audioRef = useRef<HTMLAudioElement>(null); // por padrão iniciada como null
  const [progress, setProgress] = useState(0);

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping,
    isShuffling, 
    togglePlay,
    toggleLoop,
    setPlayingState,
    playNext,
    playPrevious,
    toggleShuffle,
    clearPlayerState,
    hasNext,
    hasPrevious,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex]

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"/>
        <strong>Tocando agora </strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          < Image 
            width={592} 
            height={592} 
            src={episode.thumbnail} 
            objectFit='cover'
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ): (
        <div className={styles.emptyPlayer}>
        <strong>Selecione um podcast para ouvir</strong>
      </div>

      ) }

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>

          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}> 
            { episode? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff'}}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
              />

            ) : ( 
              <div className={styles.emptySlider} /> 
            ) }

          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        { episode && (
          <audio
            src={episode.url}
            ref={audioRef} // pode ser usada em todo elemento Html, similar a manipulacao do DOM
            autoPlay
            onEnded={handleEpisodeEnded}
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button 
            type="button" 
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''} 
            disabled={!episode || episodeList.length === 1}
          >
            <img src="/shuffle.svg" alt="Aleatório/ Embaralhar"/>
          </button>
          <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior"/>
          </button>
          <button 
          type="button" 
          className={styles.playButton} 
          disabled={!episode}
          onClick={togglePlay}
          >
            { isPlaying ? (
              <img src="/pause.svg" alt="Parar"/>
            ) : (
                <img src="/play.svg" alt="Tocar"/>
            )}
          </button>
          <button type="button" onClick={playNext} disabled={!episode || !hasNext} >
            <img src="/play-next.svg" alt="Tocar próxima"/>
          </button>
          <button 
            type="button"
            onClick={toggleLoop} 
            disabled={!episode}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
  );
}