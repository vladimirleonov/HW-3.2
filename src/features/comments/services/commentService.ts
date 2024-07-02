import {postMongoRepository} from "../../posts/repository/postMongoRepository"
import {PostDbType} from "../../../db/models/post.model"
import {Result, ResultStatus} from "../../../common/types/result"
import {CommentDbType, CommentDocument, CommentModel} from "../../../db/models/comment.model"
import {ObjectId} from "mongodb"
import {CommentBodyInputType} from "../input-output-types/comment-types"
import {UserDbType} from "../../../db/models/user.model"
import {userMongoRepository} from "../../users/repository/userMongoRepository"
import {commentMongoRepository} from "../repository/commentMongoRepository"
import { WithId } from "mongodb"

export const commentService = {
    async createComment(postId: string, input: CommentBodyInputType, userId: string): Promise<Result<string | null>> {
        const post: WithId<PostDbType> | null = await postMongoRepository.findById(postId)
        if (!post) {
            return {
                status: ResultStatus.NotFound,
                extensions: [{field: 'post', message: "Post with specified postId doesn't exist"}],
                data: null
            }
        }

        const user: UserDbType | null = await userMongoRepository.findUserById(userId)
        if (!user) {
            return {
                status: ResultStatus.Unauthorized,
                extensions: [{field: 'user', message: "User doesn't exist"}],
                data: null
            }
        }

        const newComment: CommentDocument = new CommentModel({
            _id: new ObjectId(),
            postId: new ObjectId(postId),
            content: input.content,
            commentatorInfo: {
                userId: userId,
                userLogin: user.login
            },
            createdAt: new Date().toISOString()
        })

        const createdComment: CommentDocument = await commentMongoRepository.save(newComment)
        //const createdId: string = await commentMongoRepository.create(newComment)

        return {
            status: ResultStatus.Success,
            data: createdComment._id.toString()
        }
    },
    async updateComment(id: string, input: CommentBodyInputType, userId: string): Promise<Result> {
        const comment: WithId<CommentDbType> | null = await commentMongoRepository.findById(id)
        if (!comment) {
            return {
                status: ResultStatus.NotFound,
                extensions: [{field: 'comment', message: "Comment with id doesn't exist"}],
                data: null
            }
        }

        if (userId !== comment.commentatorInfo.userId) {
            return {
                status: ResultStatus.Forbidden,
                extensions: [{field: 'user', message: "Comment doesn't belongs to user"}],
                data: null
            }
        }

        const isUpdated: boolean = await commentMongoRepository.update(id, input)
        //? check !isUpdated
        if (!isUpdated) {
            return {
                status: ResultStatus.InternalError,
                data: null
            }
        }
        return {
            status: ResultStatus.Success,
            data: null
        }
    },
    async deleteComment(id: string, userId: string): Promise<Result> {
        const comment: WithId<CommentDbType> | null = await commentMongoRepository.findById(id)
        if (!comment) {
            return {
                status: ResultStatus.NotFound,
                extensions: [{field: 'userId', message: "Comment doesn't exist"}],
                data: null
            }
        }

        if (comment.commentatorInfo.userId !== userId) {
            return {
                status: ResultStatus.Forbidden,
                extensions: [{field: 'userId', message: "Comment doesn't belongs to user"}],
                data: null
            }
        }

        const isDeleted: boolean = await commentMongoRepository.deleteOne(id)
        if (!isDeleted) {
            return {
                status: ResultStatus.InternalError,
                data: null
            }
        }

        return {
            status: ResultStatus.Success,
            data: null
        }
    }
}






// export const commentService = {
//     async createComment(postId: string, input: CommentBodyInputType, userId: string): Promise<Result<string | null>> {
//         const post: PostDbType | null = await postMongoRepository.findById(postId)
//         if (!post) {
//             return {
//                 status: ResultStatus.NotFound,
//                 extensions: [{field: 'post', message: "Post with specified postId doesn't exist"}],
//                 data: null
//             }
//         }

//         const user: UserDbType | null = await userMongoRepository.findUserById(userId)
//         if (!user) {
//             return {
//                 status: ResultStatus.Unauthorized,
//                 extensions: [{field: 'user', message: "User doesn't exist"}],
//                 data: null
//             }
//         }

//         const newComment: CommentDbType = {
//             _id: new ObjectId(),
//             postId: new ObjectId(postId),
//             content: input.content,
//             commentatorInfo: {
//                 userId: userId,
//                 userLogin: user.login
//             },
//             createdAt: new Date().toISOString()
//         }

//         const createdId: string = await commentMongoRepository.create(newComment)

//         return {
//             status: ResultStatus.Success,
//             data: createdId
//         }
//     },
//     async updateComment(id: string, input: CommentBodyInputType, userId: string): Promise<Result> {
//         const comment: CommentDbType | null = await commentMongoRepository.findById(id)
//         if (!comment) {
//             return {
//                 status: ResultStatus.NotFound,
//                 extensions: [{field: 'comment', message: "Comment with id doesn't exist"}],
//                 data: null
//             }
//         }

//         if (userId !== comment.commentatorInfo.userId) {
//             return {
//                 status: ResultStatus.Forbidden,
//                 extensions: [{field: 'user', message: "Comment doesn't belongs to user"}],
//                 data: null
//             }
//         }

//         const isUpdated: boolean = await commentMongoRepository.update(id, input)
//         //? check !isUpdated
//         if (!isUpdated) {
//             return {
//                 status: ResultStatus.InternalError,
//                 data: null
//             }
//         }
//         return {
//             status: ResultStatus.Success,
//             data: null
//         }
//     },
//     async deleteComment(id: string, userId: string): Promise<Result> {
//         const comment: CommentDbType | null = await commentMongoRepository.findById(id)
//         if (!comment) {
//             return {
//                 status: ResultStatus.NotFound,
//                 extensions: [{field: 'userId', message: "Comment doesn't exist"}],
//                 data: null
//             }
//         }

//         if (comment.commentatorInfo.userId !== userId) {
//             return {
//                 status: ResultStatus.Forbidden,
//                 extensions: [{field: 'userId', message: "Comment doesn't belongs to user"}],
//                 data: null
//             }
//         }

//         const isDeleted: boolean = await commentMongoRepository.deleteOne(id)
//         if (!isDeleted) {
//             return {
//                 status: ResultStatus.InternalError,
//                 data: null
//             }
//         }

//         return {
//             status: ResultStatus.Success,
//             data: null
//         }
//     }
// }