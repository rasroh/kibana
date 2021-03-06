import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../../src/core/server';

import { TimelinesPluginSetup, TimelinesPluginStart } from './types';
import { defineRoutes } from './routes';

export class TimelinesPlugin implements Plugin<TimelinesPluginSetup, TimelinesPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('timelines: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('timelines: Started');
    return {};
  }

  public stop() {}
}
