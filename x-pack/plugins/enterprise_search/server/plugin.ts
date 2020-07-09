/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  Plugin,
  PluginInitializerContext,
  CoreSetup,
  Logger,
  SavedObjectsServiceStart,
  IRouter,
  KibanaRequest,
} from 'src/core/server';
import { UsageCollectionSetup } from 'src/plugins/usage_collection/server';
import { SecurityPluginSetup } from '../../security/server';
import { PluginSetupContract as FeaturesPluginSetup } from '../../features/server';

import { ConfigType } from './';
import { checkAccess } from './lib/check_access';
import { registerPublicUrlRoute } from './routes/enterprise_search/public_url';
import { registerEnginesRoute } from './routes/app_search/engines';
import { registerTelemetryRoute } from './routes/app_search/telemetry';
import { registerTelemetryUsageCollector } from './collectors/app_search/telemetry';
import { appSearchTelemetryType } from './saved_objects/app_search/telemetry';

export interface PluginsSetup {
  usageCollection?: UsageCollectionSetup;
  security?: SecurityPluginSetup;
  features: FeaturesPluginSetup;
}

export interface IRouteDependencies {
  router: IRouter;
  config: ConfigType;
  log: Logger;
  getSavedObjectsService?(): SavedObjectsServiceStart;
}

export class EnterpriseSearchPlugin implements Plugin {
  private config: Observable<ConfigType>;
  private logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.config = initializerContext.config.create<ConfigType>();
    this.logger = initializerContext.logger.get();
  }

  public async setup(
    { capabilities, http, savedObjects, getStartServices }: CoreSetup,
    { usageCollection, security, features }: PluginsSetup
  ) {
    const config = await this.config.pipe(first()).toPromise();

    /**
     * Register space/feature control
     */
    features.registerFeature({
      id: 'enterpriseSearch',
      name: 'Enterprise Search',
      order: 0,
      icon: 'logoEnterpriseSearch',
      navLinkId: 'appSearch', // TODO - remove this once functional tests no longer rely on navLinkId
      app: ['kibana', 'appSearch'], // TODO: 'enterpriseSearch', 'workplaceSearch'
      catalogue: ['appSearch'], // TODO: 'enterpriseSearch', 'workplaceSearch'
      privileges: null,
    });

    /**
     * Register user access to the Enterprise Search plugins
     */
    capabilities.registerSwitcher(async (request: KibanaRequest) => {
      const dependencies = { config, security, request, log: this.logger };

      const { hasAppSearchAccess } = await checkAccess(dependencies);
      // TODO: hasWorkplaceSearchAccess

      return {
        navLinks: {
          appSearch: hasAppSearchAccess,
        },
        catalogue: {
          appSearch: hasAppSearchAccess,
        },
      };
    });

    /**
     * Register routes
     */
    const router = http.createRouter();
    const dependencies = { router, config, log: this.logger };

    registerPublicUrlRoute(dependencies);
    registerEnginesRoute(dependencies);

    /**
     * Bootstrap the routes, saved objects, and collector for telemetry
     */
    savedObjects.registerType(appSearchTelemetryType);
    let savedObjectsStarted: SavedObjectsServiceStart;

    getStartServices().then(([coreStart]) => {
      savedObjectsStarted = coreStart.savedObjects;
      if (usageCollection) {
        registerTelemetryUsageCollector(usageCollection, savedObjectsStarted, this.logger);
      }
    });
    registerTelemetryRoute({
      ...dependencies,
      getSavedObjectsService: () => savedObjectsStarted,
    });
  }

  public start() {}

  public stop() {}
}
