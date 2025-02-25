import {Request, Response, NextFunction} from "express"
import {HTTP_CODES} from "../../../settings"
import {blogMongoRepository} from "../repository/blogMongoRepository"
import {BlogDBType} from "../../../db/db-types/blog-db-types";

export const blogIdParamValidator = async (req: Request, res: Response, next: NextFunction) => {
    const blogId: string = req.params.blogId
    try {
        const blog: BlogDBType | null = await blogMongoRepository.findById(blogId)
        if (!blog) {
            return res.status(HTTP_CODES.NOT_FOUND).send({error: 'Blog not found'})
        }
    } catch (err) {
        console.error(err)
        return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).send()
    }

    return next()
}