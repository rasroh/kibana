/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PluginInitializerContext, PluginConfigDescriptor } from 'kibana/server';
import { TelemetryPlugin } from './plugin';
import * as constants from '../common/constants';
import { configSchema, TelemetryConfigType } from './config';

export { FetcherTask } from './fetcher';
export { handleOldSettings } from './handle_old_settings';
export type { TelemetryPluginSetup, TelemetryPluginStart } from './plugin';

export const config: PluginConfigDescriptor<TelemetryConfigType> = {
  schema: configSchema,
  exposeToBrowser: {
    enabled: true,
    url: true,
    banner: true,
    allowChangingOptInStatus: true,
    optIn: true,
    optInStatusUrl: true,
    sendUsageFrom: true,
  },
};

export const plugin = (initializerContext: PluginInitializerContext<TelemetryConfigType>) =>
  new TelemetryPlugin(initializerContext);
export { constants };
export {
  getClusterUuids,
  getLocalStats,
  DATA_TELEMETRY_ID,
  buildDataTelemetryPayload,
} from './telemetry_collection';

export type {
  TelemetryLocalStats,
  DataTelemetryIndex,
  DataTelemetryPayload,
} from './telemetry_collection';
