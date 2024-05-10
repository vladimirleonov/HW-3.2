import { ObjectId } from "mongodb";
import { BlogDBType } from "../../src/db/db-types/blog-db-types";

export const generateBlogsDataset = (count = 2): {blogs: BlogDBType[]} => {
    const currentDate = new Date().toISOString();
    const blogs: BlogDBType[] = [];

    for (let i = 1; i <= count; i++) {
        blogs.push({
            _id: new ObjectId(),
            name: `name${i}`,
            description: `description${i}`,
            websiteUrl: `https://websiteUrl${i}.com`,
            createdAt: currentDate,
            isMembership: false
        });
    }

    return { blogs };
};
