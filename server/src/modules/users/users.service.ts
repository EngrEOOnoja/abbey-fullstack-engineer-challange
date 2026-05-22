import { UsersRepository } from './users.repository';

const usersRepo = new UsersRepository();

/**
 * Business logic layer for user operations.
 * Orchestrates repository calls and applies domain rules.
 */
export class UsersService {
  async getAllDevelopers(currentUserId: number, search?: string) {
    return usersRepo.findAll(currentUserId, search);
  }

  async getDeveloperProfile(targetId: number, currentUserId: number) {
    if (isNaN(targetId)) {
      throw { status: 400, message: 'Invalid user ID' };
    }

    const user = await usersRepo.findById(targetId, currentUserId);
    if (!user) {
      throw { status: 404, message: 'Developer not found' };
    }

    const followStats = await usersRepo.getFollowStats(targetId);

    return {
      ...user,
      followersCount: followStats?.followers_count || 0,
      followingCount: followStats?.following_count || 0
    };
  }

  async updateProfile(userId: number, data: {
    name: string;
    bio?: string;
    github_url?: string;
    avatar_url?: string;
    skills?: string;
  }) {
    if (!data.name) {
      throw { status: 400, message: 'Name is required' };
    }

    const updatedUser = await usersRepo.updateProfile(userId, data);
    return {
      message: 'Profile updated successfully',
      user: updatedUser
    };
  }
}
