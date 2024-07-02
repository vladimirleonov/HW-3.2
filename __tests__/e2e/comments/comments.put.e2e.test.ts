import {req} from "../../helpers/req"
import {HTTP_CODES, SETTINGS} from "../../../src/settings"
import {
    CommentBodyInputType, CommentOutputType
} from "../../../src/features/comments/input-output-types/comment-types"
import {base64Adapter} from "../../../src/common/adapters/base64.adapter"
import {AUTH_DATA} from "../../../src/settings"
import {MongoMemoryServer} from "mongodb-memory-server"
import {db} from "../../../src/db/mongoose-db-connection"
import {createPost} from "../helpers/post-helpers"
import {PostOutputType} from "../../../src/features/posts/input-output-types/post-types"
import {BlogOutputType} from "../../../src/features/blogs/input-output-types/blog-types"
import {createBlog} from "../helpers/blog-helpers"
import {loginUser} from "../helpers/auth-helpers"
import {LoginOutputControllerType} from "../../../src/features/auth/types/outputTypes/authOutputControllersTypes";
import {createComment} from "../helpers/comment-helpers"
import {ObjectId} from "mongodb"

describe('PUT /comments', () => {
    beforeAll(async () => {
        const mongoServer: MongoMemoryServer = await MongoMemoryServer.create()
        await db.run(mongoServer.getUri())
    })
    afterAll(async () => {
        await db.stop()
    })
    beforeEach(async () => {
        await db.drop()
    })
    it('+ PUT comment with correct input data: STATUS 204', async () => {
        const blog: BlogOutputType = await createBlog()
        const blogId: string = blog.id

        const post: PostOutputType = await createPost(blogId)
        const postId: string = post.id

        const authData: LoginOutputControllerType = await loginUser()

        const comment: CommentOutputType = await createComment(postId, authData.accessToken)

        const newComment: CommentBodyInputType = {
            content: 'newCommentnewCommentnewCommentnewComment'
        }

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
            .set('authorization', `Bearer ${authData.accessToken}`)
            .send(newComment)
            .expect(HTTP_CODES.NO_CONTENT)
    })
    it('- PUT comment when when content must be more than 20 characters long: STATUS 400', async () => {
        const blog: BlogOutputType = await createBlog()
        const blogId: string = blog.id

        const post: PostOutputType = await createPost(blogId)
        const postId: string = post.id

        const authData: LoginOutputControllerType = await loginUser()

        const comment: CommentOutputType = await createComment(postId, authData.accessToken)

        const newComment: CommentBodyInputType = {
            content: 'newCommentnew'
        }

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
            .set('authorization', `Bearer ${authData.accessToken}`)
            .send(newComment)
            .expect(HTTP_CODES.BAD_REQUEST)
    })
    it('- PUT comment unauthorized: STATUS 401', async () => {
        const blog: BlogOutputType = await createBlog()
        const blogId: string = blog.id

        const post: PostOutputType = await createPost(blogId)
        const postId: string = post.id

        const authData: LoginOutputControllerType = await loginUser()

        const comment: CommentOutputType = await createComment(postId, authData.accessToken)

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${postId}`)
            .set('authorization', `Basic asdfdafqeasdasdqwe`)
            .send(comment)
            .expect(HTTP_CODES.UNAUTHORIZED)
    })
    it('- PUT comment when content does not belongs to user: STATUS 403', async () => {
        const blog: BlogOutputType = await createBlog()
        const blogId: string = blog.id

        const post: PostOutputType = await createPost(blogId)
        const postId: string = post.id

        const authData: LoginOutputControllerType = await loginUser()

        const comment: CommentOutputType = await createComment(postId, authData.accessToken)

        await req.post(SETTINGS.PATH.USERS)
            .set('authorization', `Basic ${base64Adapter.encodeToBase64(AUTH_DATA.ADMIN_AUTH)}`)
            .send({
                login: 'testtest1',
                email: 'testtest1@gmail.com',
                password: 'testtest1'
            }).expect(HTTP_CODES.CREATED)

        const loginRes = await req.post(`${SETTINGS.PATH.AUTH}/login`)
            .send({
                loginOrEmail: 'testtest1',
                password: 'testtest1'
            }).expect(HTTP_CODES.OK)

        const newComment: CommentBodyInputType = {
            content: 'newCommentnewCommentnewComment'
        }

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${comment.id}`)
            .set('authorization', `Bearer ${loginRes.body.accessToken}`)
            .send(newComment)
            .expect(HTTP_CODES.FORBIDDEN)
    })
    it('- PUT comment not found: STATUS 204', async () => {
        const blog: BlogOutputType = await createBlog()
        const blogId: string = blog.id

        const post: PostOutputType = await createPost(blogId)
        const postId: string = post.id

        const authData: LoginOutputControllerType = await loginUser()

        const comment: CommentOutputType = await createComment(postId, authData.accessToken)

        const newComment: CommentBodyInputType = {
            content: 'newCommentnewCommentnewCommentnewComment'
        }

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .set('authorization', `Bearer ${authData.accessToken}`)
            .send(newComment)
            .expect(HTTP_CODES.NOT_FOUND)
    })
})