/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SavedObject } from 'src/core/types';
import { Logger } from 'src/core/server';
import {
  AlertInstanceContext,
  AlertInstanceState,
  AlertServices,
} from '../../../../../../alerting/server';
import { ListClient } from '../../../../../../lists/server';
import { ExceptionListItemSchema } from '../../../../../common/shared_imports';
import { RefreshTypes } from '../../types';
import { getFilter } from '../get_filter';
import { getInputIndex } from '../get_input_output_index';
import { searchAfterAndBulkCreate } from '../search_after_bulk_create';
import { QueryRuleAttributes, RuleRangeTuple } from '../types';
import { TelemetryEventsSender } from '../../../telemetry/sender';
import { BuildRuleMessage } from '../rule_messages';

export const queryExecutor = async ({
  rule,
  tuples,
  listClient,
  exceptionItems,
  services,
  version,
  searchAfterSize,
  logger,
  refresh,
  eventsTelemetry,
  buildRuleMessage,
}: {
  rule: SavedObject<QueryRuleAttributes>;
  tuples: RuleRangeTuple[];
  listClient: ListClient;
  exceptionItems: ExceptionListItemSchema[];
  services: AlertServices<AlertInstanceState, AlertInstanceContext, 'default'>;
  version: string;
  searchAfterSize: number;
  logger: Logger;
  refresh: RefreshTypes;
  eventsTelemetry: TelemetryEventsSender | undefined;
  buildRuleMessage: BuildRuleMessage;
}) => {
  const ruleParams = rule.attributes.params;
  const inputIndex = await getInputIndex(services, version, ruleParams.index);
  const esFilter = await getFilter({
    type: ruleParams.type,
    filters: ruleParams.filters,
    language: ruleParams.language,
    query: ruleParams.query,
    savedId: ruleParams.savedId,
    services,
    index: inputIndex,
    lists: exceptionItems,
  });

  return searchAfterAndBulkCreate({
    tuples,
    listClient,
    exceptionsList: exceptionItems,
    ruleParams,
    services,
    logger,
    eventsTelemetry,
    id: rule.id,
    inputIndexPattern: inputIndex,
    signalsIndex: ruleParams.outputIndex,
    filter: esFilter,
    actions: rule.attributes.actions,
    name: rule.attributes.name,
    createdBy: rule.attributes.createdBy,
    createdAt: rule.attributes.createdAt,
    updatedBy: rule.attributes.updatedBy,
    updatedAt: rule.updated_at ?? '',
    interval: rule.attributes.schedule.interval,
    enabled: rule.attributes.enabled,
    pageSize: searchAfterSize,
    refresh,
    tags: rule.attributes.tags,
    throttle: rule.attributes.throttle,
    buildRuleMessage,
  });
};
