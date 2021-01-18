/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { lazy } from 'react';
import { i18n } from '@kbn/i18n';
import {
  ActionTypeModel,
  GenericValidationResult,
  ConnectorValidationResult,
} from '../../../../types';
import { ServerLogActionParams } from '../types';

export function getActionType(): ActionTypeModel<unknown, unknown, ServerLogActionParams> {
  return {
    id: '.server-log',
    iconClass: 'logsApp',
    selectMessage: i18n.translate(
      'xpack.triggersActionsUI.components.builtinActionTypes.serverLogAction.selectMessageText',
      {
        defaultMessage: 'Add a message to a Kibana log.',
      }
    ),
    actionTypeTitle: i18n.translate(
      'xpack.triggersActionsUI.components.builtinActionTypes.serverLogAction.actionTypeTitle',
      {
        defaultMessage: 'Send to Server log',
      }
    ),
    validateConnector: (): ConnectorValidationResult<unknown, unknown> => {
      return { config: { errors: {} }, secrets: { errors: {} } };
    },
    validateParams: (
      actionParams: ServerLogActionParams
    ): GenericValidationResult<Pick<ServerLogActionParams, 'message'>> => {
      const errors = {
        message: new Array<string>(),
      };
      const validationResult = { errors };
      if (!actionParams.message?.length) {
        errors.message.push(
          i18n.translate(
            'xpack.triggersActionsUI.components.builtinActionTypes.error.requiredServerLogMessageText',
            {
              defaultMessage: 'Message is required.',
            }
          )
        );
      }
      return validationResult;
    },
    actionConnectorFields: null,
    actionParamsFields: lazy(() => import('./server_log_params')),
  };
}
