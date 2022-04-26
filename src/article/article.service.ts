import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, getRepository, Repository } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { UserEntity } from "../user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";
import { UpdateArticleDto } from "./dto/updateArticleDto";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
  ) {}

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

  async addArticleToFavorites(slug: string, userId: number): Promise<ArticleEntity> {
    const article = await this.getSingleArticle(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ["favorites"],
    });

    const isNotFavorited = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(slug: string, userId: number): Promise<ArticleEntity> {
    const article = await this.getSingleArticle(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ["favorites"],
    });

    const articleIndex = user.favorites.findIndex(articleInFavorites => articleInFavorites.id === article.id);

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  //pagination and filtering
  async findAll(currentUser: UserEntity, query: any): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity).createQueryBuilder("articles").leftJoinAndSelect("articles.author", "author");

    // filter by tagList
    if (query.tag) {
      queryBuilder.andWhere("articles.tagList LIKE :tag", {
        tag: `%${query.tag}%`,
      });
    }

    // filter by author
    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });

      queryBuilder.andWhere("articles.authorId = :id", {
        id: author.id,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({ username: query.favorited }, { relations: ["favorites"] });
      const ids = author.favorites.map(el => el.id);

      if (ids.length > 0) {
        queryBuilder.andWhere("articles.authorId IN (:...ids)", { ids });
      } else {
        queryBuilder.andWhere("1=0");
      }
      console.log("author", author);
    }

    // order by last added article
    queryBuilder.orderBy("articles.createdAt", "DESC");

    const articlesCount = await queryBuilder.getCount();

    // set limit
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    // set offset
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    //adding favorited attribute
    let favoriteIds: number[] = [];

    if (currentUser) {
      const currUser = await this.userRepository.findOne(currentUser.id, {
        relations: ["favorites"],
      });
      favoriteIds = currUser.favorites.map(favorite => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map(article => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
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
