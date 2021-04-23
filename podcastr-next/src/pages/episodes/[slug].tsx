import {  GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurantionToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import Image from 'next/image';
import Link from 'next/link';

type Episode = {
  id: string,
  title: string,
  thumbnail: string,
  description: string,
  members: string,
  duration: number,
  durationAsString: string,
  url: string,
  publishedAt: string,
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {

   // router desnecessário se eu tiver usando fallback blocking no paths 
  const router = useRouter();
  if (router.isFallback) {
    return <p>Carregando...</p>
  }

  return (
   <div className={styles.episode}>
     <div className={styles.thumbnailContainer}>
       <Link href='/'>
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
       </Link>
       <Image 
          width={700} 
          height={160} 
          src={episode.thumbnail}
          objectFit='cover'
       />
       <button type="button">
         <img src="/play.svg" alt="Tocar episódio"/>
       </button>
     </div>
     <header>
       <h1>{episode.title}</h1>
       <span>{episode.members}</span>
       <span>{episode.publishedAt}</span>
       <span>{episode.durationAsString}</span>
     </header>

     <div 
        className={styles.description} 
        dangerouslySetInnerHTML={{ __html: episode.description}} 
     />
       
   </div>
  )
}

// file system rooting 

export const getStaticPaths: GetStaticPaths = async () => {
  // geracao de algumas paginas de forma estática, serve para fazer as categorias de ecommerce
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
  // incremental static regeneration
} 

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;

  const { data } = await api.get(`episodes/${slug}`);

  const episode = {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      members: data.members,
      publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(data.file.duration),
      durationAsString: convertDurantionToTimeString(Number(data.file.duration)),
      description: data.description,
      url: data.file.url
  }
  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24 // 24 horas
  }
}