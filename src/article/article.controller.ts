import { User } from "@app/user/decorators/user.decorator";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { UserEntity } from "../user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { UpdateArticleDto } from "./dto/updateArticleDto";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import { BackendValidationPipe } from "@app/shared/pipes/backendValidation.pipe";

@Controller("articles")
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(@User() currentUser: UserEntity, @Query() query: any): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUser, query);
  }

  @Get("feed")
  @UseGuards(AuthGuard)
  async getFeed(@User("id") currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> {
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Put(":slug")
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateArticle(@User() currentUser: UserEntity, @Body("article") updateArticleDto: UpdateArticleDto, @Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(currentUser, updateArticleDto, slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async create(@User() currentUser: UserEntity, @Body("article") createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(currentUser, createArticleDto);
    return this.articleService.buildArticleResponse(article);
  }

  @Get(":slug")
  async getSingleArticle(@Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getSingleArticle(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(":slug")
  @UseGuards(AuthGuard)
  async deleteArticle(@User("id") currentUserId: number, @Param("slug") slug: string) {
    return this.articleService.deleteArticle(slug, currentUserId);
  }

  @Post(":slug/favorite")
  @UseGuards(AuthGuard)
  async addArticleToFavorites(@User("id") currentUserId: number, @Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(slug, currentUserId);

    return this.articleService.buildArticleResponse(article);
  }

  @Delete(":slug/favorite")
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(@User("id") currentUserId: number, @Param("slug") slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(slug, currentUserId);

    return this.articleService.buildArticleResponse(article);
  }
}
