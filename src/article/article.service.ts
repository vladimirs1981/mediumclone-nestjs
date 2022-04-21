import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { UserEntity } from "../user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";
import { UpdateArticleDto } from "./dto/updateArticleDto";

@Injectable()
export class ArticleService {
  constructor(@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>) {}

  async getSingleArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: {
        slug,
      },
    });
    if (!article) {
      throw new HttpException("Article Not Found", HttpStatus.NOT_FOUND);
    }
    return article;
  }

  async updateArticle(currentUser: UserEntity, updateArticleDto: UpdateArticleDto, slug: string): Promise<ArticleEntity> {
    const article = await this.getSingleArticle(slug);

    if (article.author.id !== currentUser.id) {
      throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.taglist) {
      article.taglist = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
    const article = await this.getSingleArticle(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return slugify(title, { lower: true }) + "-" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
