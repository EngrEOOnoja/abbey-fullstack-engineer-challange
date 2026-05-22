import { RelationshipsRepository } from './relationships.repository';

const relationshipsRepo = new RelationshipsRepository();

/**
 * Business logic for relationship operations (follow, unfollow, list).
 */
export class RelationshipsService {
  async follow(followerId: number, followedId: number) {
    if (!followedId) {
      throw { status: 400, message: 'Followed user ID is required' };
    }

    if (followerId === followedId) {
      throw { status: 400, message: 'You cannot follow yourself' };
    }

    const targetExists = await relationshipsRepo.userExists(followedId);
    if (!targetExists) {
      throw { status: 404, message: 'User to follow not found' };
    }

    await relationshipsRepo.follow(followerId, followedId);
    return { message: 'Successfully followed user', followedId };
  }

  async unfollow(followerId: number, followedId: number) {
    if (!followedId) {
      throw { status: 400, message: 'Followed user ID is required' };
    }

    await relationshipsRepo.unfollow(followerId, followedId);
    return { message: 'Successfully unfollowed user', followedId };
  }

  async getFollowers(targetId: number, currentUserId: number) {
    if (isNaN(targetId)) {
      throw { status: 400, message: 'Invalid user ID' };
    }
    return relationshipsRepo.getFollowers(targetId, currentUserId);
  }

  async getFollowing(targetId: number, currentUserId: number) {
    if (isNaN(targetId)) {
      throw { status: 400, message: 'Invalid user ID' };
    }
    return relationshipsRepo.getFollowing(targetId, currentUserId);
  }
}
