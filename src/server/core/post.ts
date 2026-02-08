import { reddit, redis } from '@devvit/web/server';
import { filterComments, shuffle } from '../../shared/data-gen';

const subreddits = [
  'AskReddit',
  'showerthoughts',
  'todayilearned',
  'unpopularopinion',
  'explainlikeimfive',
];

const batchSize = 3;

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

  const seed = Date.now() % 100000;
  const shuffledPosts = shuffle(posts.flat(), seed);

  const comments = [];
  for (let i = 0; i < shuffledPosts.length; i += batchSize) {
    const batch = shuffledPosts.slice(i, i + batchSize);
    const batchPromises = batch.map((post) =>
      reddit
        .getComments({
          postId: post.id,
          limit: 10,
          pageSize: 10,
        })
        .all()
    );
    const batchResults = await Promise.all(batchPromises);
    for (const postComments of batchResults) {
      comments.push(...postComments);
    }
  }

  const filteredComments = filterComments(comments, seed);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return await reddit.submitCustomPost({
    title: `1 More Comment - ${formattedDate}`,
    postData: {
      data: filteredComments,
      seed,
    },
  });
};

export const savePostUserProgress = async (
  postId: string,
  userId: string,
  progress: { round: number; score: number; highScore: number }
) => {
  await redis.set(`post_progress_${postId}_${userId}`, JSON.stringify(progress));
};
