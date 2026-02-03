import { reddit } from '@devvit/web/server';
import { filterComments } from '../../shared/data-gen';

const subreddits = [
  'AskReddit',
  'showerthoughts',
  'todayilearned',
  'unpopularopinion',
  'explainlikeimfive',
];

export const createPost = async () => {
  const posts = await Promise.all(
    subreddits.map((subreddit) => {
      return reddit
        .getTopPosts({
          subredditName: subreddit,
          timeframe: 'day',
          limit: 5,
          pageSize: 5,
        })
        .all();
    })
  );

  const comments = [];
  for (const post of posts.flat()) {
    const postComments = await reddit
      .getComments({
        postId: post.id,
        limit: 10,
        pageSize: 10,
      })
      .all();
    comments.push(...postComments);
  }
  const seed = Date.now() % 100000;

  const filteredComments = filterComments(comments, seed);

  return await reddit.submitCustomPost({
    title: 'one-more-comment',
    postData: {
      data: filteredComments,
      seed,
    },
  });
};
