import {PostDbType, PostDocument} from "../../../db/db-types/post-db-types"
import {PostBodyInputType} from "../input-output-types/post-types"
import {db} from "../../../db/mongoose-db"
import {DeleteResult, ObjectId, UpdateResult} from "mongodb"

export const postMongoRepository = {
    async save(post: PostDocument): Promise<PostDocument> {
        return post.save()
    },
    // async create(newPost: PostDbType): Promise<string> {
    //     const insertedInfo: InsertOneResult<PostDbType> = await db.getCollections().postCollection.insertOne(newPost)
    //     return insertedInfo.insertedId.toString()
    // },
    // async createBlogPost(newPost: PostDbType): Promise<string> {
    //     const insertedInfo: InsertOneResult<PostDbType> = await db.getCollections().postCollection.insertOne(newPost)
    //     return insertedInfo.insertedId.toString()
    // },
    async update(id: string, {blogId, ...restInput}: PostBodyInputType): Promise<boolean> {
        const updatedInfo: UpdateResult<PostDbType> = await db.getCollections().postCollection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {
                    blogId: new ObjectId(blogId),
                    ...restInput
                }
            }
        )

        return updatedInfo.matchedCount === 1
    },
    async delete(id: string): Promise<boolean> {
        const deletedInfo: DeleteResult = await db.getCollections().postCollection.deleteOne({_id: new ObjectId(id)})
        return deletedInfo.deletedCount === 1
    },
    async findById(id: string): Promise<PostDbType | null> {
        if (!this.isValidObjectId(id)) return null
        return await db.getCollections().postCollection.findOne({_id: new ObjectId(id)})
    },
    isValidObjectId(id: string): boolean {
        return ObjectId.isValid(id)
    }
}