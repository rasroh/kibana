/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { PluginInitializerContext, Plugin, CoreSetup } from 'src/core/server';
import { pickWithPatterns } from '../../rule_registry/server';
import { ObservabilityConfig } from '.';
import {
  bootstrapAnnotations,
  ScopedAnnotationsClientFactory,
  AnnotationsAPI,
} from './lib/annotations/bootstrap_annotations';
import type { RuleRegistryPluginSetupContract } from '../../rule_registry/server';
import { uiSettings } from './ui_settings';
import { ecsFieldMap } from '../../rule_registry/server';

export type ObservabilityPluginSetup = ReturnType<ObservabilityPlugin['setup']>;

export class ObservabilityPlugin implements Plugin<ObservabilityPluginSetup> {
  constructor(private readonly initContext: PluginInitializerContext) {
    this.initContext = initContext;
  }

  public setup(
    core: CoreSetup,
    plugins: {
      ruleRegistry: RuleRegistryPluginSetupContract;
    }
  ) {
    const config = this.initContext.config.get<ObservabilityConfig>();

    let annotationsApiPromise: Promise<AnnotationsAPI> | undefined;

    core.uiSettings.register(uiSettings);

    if (config.annotations.enabled) {
      annotationsApiPromise = bootstrapAnnotations({
        core,
        index: config.annotations.index,
        context: this.initContext,
      }).catch((err) => {
        const logger = this.initContext.logger.get('annotations');
        logger.warn(err);
        throw err;
      });
    }

    return {
      getScopedAnnotationsClient: async (...args: Parameters<ScopedAnnotationsClientFactory>) => {
        const api = await annotationsApiPromise;
        return api?.getScopedAnnotationsClient(...args);
      },
      ruleRegistry: plugins.ruleRegistry.create({
        name: 'observability',
        fieldMap: {
          ...pickWithPatterns(ecsFieldMap, 'host.name', 'service.name'),
        },
      }),
    };
  }

  public start() {}

  public stop() {}
}
