import { IndexRoute, Routes, Route as NgrxRoute } from '@ngrx/router';
import { Async } from '@ngrx/router/resource-loader';
import { Route } from 'typesafe-urls';
import { zip, map, dropWhile } from 'lodash';

export interface UncompiledRoute extends IndexRoute {
  path?: Route<any>;
  guards?: any[];
  index?: IndexRoute;
  loadIndex?: Async<IndexRoute>;
  children?: UncompiledRoutes;
  loadChildren?: Async<Routes>;
}

export type UncompiledRoutes = Array<UncompiledRoute>;

function buildRoute(route: UncompiledRoute, currentPath: Array<string>): NgrxRoute {
  const { path, children } = route;
  const relativePath = path && map(dropWhile(zip(path.parts, currentPath), ([a, b]) => a === b), a => a[0]);

  return Object.assign({}, route, {
    path: path && (currentPath.length === 0 ? '/' : '') + relativePath.join('/'),
    children: children && children.map(child => buildRoute(child, relativePath || currentPath)),
  });
}

export function buildRoutes<P>(routes: UncompiledRoutes): Routes {
  return routes.map(route => buildRoute(route, []));
}
