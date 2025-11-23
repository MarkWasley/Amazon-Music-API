import { OpenAPIHono } from "@hono/zod-openapi";

export interface FetchOptions {
  url: string;
  body?: unknown;
  pageUrl?: string;
}

export interface Routes {
  controller: OpenAPIHono
  initRoutes: () => void
}

export interface SearchArgs {
  query: string
  page?: number
}

export interface Obj {
  [key: string]: any
}

export interface IUseCase<T extends Obj | string = any, Tres = any> {
  execute: (params: T) => Promise<Tres>
}