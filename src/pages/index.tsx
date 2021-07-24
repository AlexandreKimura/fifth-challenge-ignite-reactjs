/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useEffect } from 'react';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>();

  function handleMorePosts(link: string): void {
    fetch(link)
      .then(response => response.json())
      .then(responseData => {
        console.log(responseData);
      });
  }

  return (
    <>
      <main className={styles.homeContainer}>
        <div>
          {postsPagination.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <p className={styles.title}>{post.data.title}</p>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <time>{post.first_publication_date}</time>
                  <strong>{post.data.author}</strong>
                </div>
              </a>
            </Link>
          ))}
          {postsPagination.next_page ? (
            <button
              type="button"
              onClick={() => handleMorePosts(postsPagination.next_page)}
            >
              Carregar mais posts
            </button>
          ) : (
            ''
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'repeatable')],
    {
      fetch: ['repeatable.title', 'repeatable.subtitle', 'repeatable.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.last_publication_date),
        `dd MMM yyyy`,
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      revalidate: 60 * 60 * 24, // 24 hours
    },
  };
};
