/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { handleActions } from 'redux-actions';
import { indexStatusAction } from '../actions';
import { handleAsyncAction } from './utils';
import { IReducerState } from './types';
import { StatesIndexStatus } from '../../../common/runtime_types';

export interface IndexStatusState extends IReducerState {
  data: StatesIndexStatus | null;
}

const initialState: IndexStatusState = {
  data: null,
  loading: false,
  errors: [],
};

type PayLoad = StatesIndexStatus & Error;

export const indexStatusReducer = handleActions<IndexStatusState, PayLoad>(
  {
    ...handleAsyncAction('data', indexStatusAction),
  },
  initialState
);
