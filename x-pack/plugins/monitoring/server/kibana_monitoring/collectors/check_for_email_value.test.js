/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { checkForEmailValue } from './get_settings_collector';

describe('getSettingsCollector / checkForEmailValue', () => {
  it('ignores shouldUseNull=true value and returns email if email value if one is set', async () => {
    const shouldUseNull = true;
    const getDefaultAdminEmailMock = () => 'test@elastic.co';
    expect(await checkForEmailValue(undefined, shouldUseNull, getDefaultAdminEmailMock)).toBe(
      'test@elastic.co'
    );
  });

  it('ignores shouldUseNull=false value and returns email if email value if one is set', async () => {
    const shouldUseNull = false;
    const getDefaultAdminEmailMock = () => 'test@elastic.co';
    expect(await checkForEmailValue(undefined, shouldUseNull, getDefaultAdminEmailMock)).toBe(
      'test@elastic.co'
    );
  });

  it('returns a null if no email value is set and null is allowed', async () => {
    const shouldUseNull = true;
    const getDefaultAdminEmailMock = () => null;
    expect(await checkForEmailValue(undefined, shouldUseNull, getDefaultAdminEmailMock)).toBe(null);
  });

  it('returns undefined if no email value is set and null is not allowed', async () => {
    const shouldUseNull = false;
    const getDefaultAdminEmailMock = () => null;
    expect(await checkForEmailValue(undefined, shouldUseNull, getDefaultAdminEmailMock)).toBe(
      undefined
    );
  });
});
