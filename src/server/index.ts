import express from 'express';
import { redis, reddit, createServer, context, getServerPort, cache } from '@devvit/web/server';
import { createPost, savePostUserProgress } from './core/post';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, { progress: any } | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId, userId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const progressStr = await redis.get(`post_progress_${postId}_${userId}`);
      const progress = progressStr ? JSON.parse(progressStr) : { round: 0, score: 0, highScore: 0 };

      res.json({
        progress,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{ id: string }, { comment: any } | { status: string; message: string }, unknown>(
  '/api/comment/:id',
  async (req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    const commentId = req.params.id;
    const result = await cache(
      async () => {
        const commentObj = await reddit.getCommentById(commentId as any);
        const comment = commentObj.toJSON();
        return {
          body: comment.body,
          subreddit: comment.subredditName,
          postId: comment.postId,
          url: comment.url,
        };
      },
      {
        key: `comment_${commentId}`,
        ttl: 24 * 60 * 60,
      }
    );

    res.json({
      comment: result,
    });
  }
);

router.post('/api/save', async (req, res): Promise<void> => {
  try {
    if (!context.postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    if (!context.userId) {
      res.json({
        status: 'skipped',
        message: `Progress skipped`,
      });
      return;
    }

    await savePostUserProgress(
      context.postId!,
      context.userId!,
      req.body as { round: number; score: number; highScore: number }
    );

    res.json({
      status: 'success',
      message: `Progress saved for user ${context.userId} in post ${context.postId}`,
    });
  } catch (error) {
    console.error(`Error saving progress: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to save progress',
    });
  }
});

router.post('/api/reply', async (req, res): Promise<void> => {
  try {
    const { username, postId, subredditName } = context;
    if (!postId) {
      console.error('API Reply Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }
    const body = `u/${username} guessed your comment with ${req.body.accuracy}% accuracy! Play r/${subredditName} to see how well you did!`;
    await reddit.submitComment({
      id: req.body.commentId,
      text: body,
      runAs: 'APP',
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
