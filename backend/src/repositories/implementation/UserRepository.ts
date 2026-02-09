import User, { IUser } from '../../models/User';
import { IUserRepository } from '../interface/IUserRepository';

export class UserRepository implements IUserRepository {
    async createUser(email: string, passwordHash: string): Promise<IUser> {
        const count = await User.countDocuments();
        const role = count === 0 ? 'admin' : 'user';
        const user = new User({ email, passwordHash, role });
        return await user.save();
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findUserById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    // async findAll(page: number, limit: number, search: string): Promise<{ users: IUser[]; total: number }> {
    //     const pipeline: any[] = [];

    //     // Match for search
    //     if (search) {
    //         pipeline.push({
    //             $match: {
    //                 email: { $regex: search, $options: 'i' }
    //             }
    //         });
    //     }

    //     // Sort
    //     pipeline.push({ $sort: { createdAt: -1 } });

    //     // Lookup KYC
    //     pipeline.push({
    //         $lookup: {
    //             from: 'kycs',
    //             localField: '_id',
    //             foreignField: 'user',
    //             as: 'kycData'
    //         }
    //     });

    //     // Unwind (optional, preserveNullAndEmptyArrays: true to keep users without KYC)
    //     pipeline.push({
    //         $unwind: {
    //             path: '$kycData',
    //             preserveNullAndEmptyArrays: true
    //         }
    //     });

    //     // Add fields for easier access (or just leave as kycData object, but frontend might prefer flat)
    //     pipeline.push({
    //         $addFields: {
    //             kycStatus: { $ifNull: ['$kycData.status', 'not_submitted'] },
    //             kycImage: '$kycData.imageUrl',
    //             kycVideo: '$kycData.videoUrl'
    //         }
    //     });

    //     // Project to remove password and clean up
    //     pipeline.push({
    //         $project: {
    //             passwordHash: 0,
    //             kycData: 0, // Remove raw array
    //             __v: 0
    //         }
    //     });

    //     const countPipeline = [...pipeline]; // Clone before skip/limit for total count
    //     // Actually count logic for aggregate is complex if we do it after skip/limit.
    //     // We need total count filtering only by search.

    //     // Let's do parallel query: Count separately (only search filter)
    //     // Main query: Aggregate with pagination.

    //     // Count Query
    //     const countQuery: any = {};
    //     if (search) {
    //         countQuery.email = { $regex: search, $options: 'i' };
    //     }
    //     const skip = (page - 1) * limit

    //     // Pagination for main pipeline
    //     pipeline.push({ $skip: skip });
    //     pipeline.push({ $limit: limit });

    //     const [users, totalCount] = await Promise.all([
    //         User.aggregate(pipeline),
    //         User.countDocuments(countQuery)
    //     ]);

    //     return { users, total: totalCount };
    // }

    async findAll(
  page: number,
  limit: number,
  search: string
): Promise<{ users: IUser[]; total: number }> {

  const pipeline: any[] = [];

  // 🔹 Match role = "user" + search
  const matchStage: any = {
    role: "user"
  };

  if (search) {
    matchStage.email = { $regex: search, $options: 'i' };
  }

  pipeline.push({ $match: matchStage });

  // Sort
  pipeline.push({ $sort: { createdAt: -1 } });

  // Lookup KYC
  pipeline.push({
    $lookup: {
      from: 'kycs',
      localField: '_id',
      foreignField: 'user',
      as: 'kycData'
    }
  });

  // Unwind
  pipeline.push({
    $unwind: {
      path: '$kycData',
      preserveNullAndEmptyArrays: true
    }
  });

  // Add fields
  pipeline.push({
    $addFields: {
      kycStatus: { $ifNull: ['$kycData.status', 'not_submitted'] },
      kycImage: '$kycData.imageUrl',
      kycVideo: '$kycData.videoUrl'
    }
  });

  // Project
  pipeline.push({
    $project: {
      passwordHash: 0,
      kycData: 0,
      __v: 0
    }
  });

  const skip = (page - 1) * limit;

  // Pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // 🔹 Count query (same filter!)
  const countQuery: any = {
    role: "user"
  };

  if (search) {
    countQuery.email = { $regex: search, $options: 'i' };
  }

  const [users, totalCount] = await Promise.all([
    User.aggregate(pipeline),
    User.countDocuments(countQuery)
  ]);

  return { users, total: totalCount };
}

}
