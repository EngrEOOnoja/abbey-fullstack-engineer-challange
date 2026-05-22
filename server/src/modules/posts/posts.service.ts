import { PostsRepository } from './posts.repository';

const postsRepo = new PostsRepository();

/**
 * Business logic for post/project-share operations.
 */
export class PostsService {
  async createPost(userId: number, content: string, projectName?: string, projectLink?: string) {
    if (!content || content.trim() === '') {
      throw { status: 400, message: 'Post content cannot be empty' };
    }

    return postsRepo.create(userId, content, projectName, projectLink);
  }

  async getFeed(userId: number, limit = 30, offset = 0) {
    return postsRepo.getFeed(userId, limit, offset);
  }

  async getUserPosts(targetId: number, limit = 30, offset = 0) {
    if (isNaN(targetId)) {
      throw { status: 400, message: 'Invalid user ID' };
    }

    return postsRepo.getByUserId(targetId, limit, offset);
  }
}
