/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import { getListResponseMock } from '../../../../../lists/common/schemas/response/list_schema.mock';
import { exportList, useDeleteList, useFindLists, ListSchema } from '../../../shared_imports';
import { TestProviders } from '../../../common/mock';
import { ValueListsModal } from './modal';

jest.mock('../../../shared_imports', () => {
  const actual = jest.requireActual('../../../shared_imports');

  return {
    ...actual,
    exportList: jest.fn(),
    useDeleteList: jest.fn(),
    useFindLists: jest.fn(),
  };
});

describe('ValueListsModal', () => {
  beforeEach(() => {
    // Do not resolve the export in tests as it causes unexpected state updates
    (exportList as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (useFindLists as jest.Mock).mockReturnValue({
      start: jest.fn(),
      result: { data: Array<ListSchema>(3).fill(getListResponseMock()), total: 3 },
    });
    (useDeleteList as jest.Mock).mockReturnValue({
      start: jest.fn(),
      result: getListResponseMock(),
    });
  });

  it('renders nothing if showModal is false', () => {
    const container = mount(
      <TestProviders>
        <ValueListsModal showModal={false} onClose={jest.fn()} />
      </TestProviders>
    );

    expect(container.find('EuiModal')).toHaveLength(0);
    container.unmount();
  });

  it('renders modal if showModal is true', () => {
    const container = mount(
      <TestProviders>
        <ValueListsModal showModal={true} onClose={jest.fn()} />
      </TestProviders>
    );

    expect(container.find('EuiModal')).toHaveLength(1);
    container.unmount();
  });

  it('calls onClose when modal is closed', () => {
    const onClose = jest.fn();
    const container = mount(
      <TestProviders>
        <ValueListsModal showModal={true} onClose={onClose} />
      </TestProviders>
    );

    container.find('button[data-test-subj="value-lists-modal-close-action"]').simulate('click');

    expect(onClose).toHaveBeenCalled();
    container.unmount();
  });

  it('renders ValueListsForm and an EuiTable', () => {
    const container = mount(
      <TestProviders>
        <ValueListsModal showModal={true} onClose={jest.fn()} />
      </TestProviders>
    );

    expect(container.find('ValueListsForm')).toHaveLength(1);
    expect(container.find('EuiBasicTable')).toHaveLength(1);
    container.unmount();
  });

  describe('modal table actions', () => {
    it('calls exportList when export is clicked', () => {
      const container = mount(
        <TestProviders>
          <ValueListsModal showModal={true} onClose={jest.fn()} />
        </TestProviders>
      );

      act(() => {
        container
          .find('button[data-test-subj="action-export-value-list"]')
          .first()
          .simulate('click');
        container.unmount();
      });

      expect(exportList).toHaveBeenCalledWith(expect.objectContaining({ listId: 'some-list-id' }));
    });

    it('calls deleteList when delete is clicked', () => {
      const deleteListMock = jest.fn();
      (useDeleteList as jest.Mock).mockReturnValue({
        start: deleteListMock,
        result: getListResponseMock(),
      });
      const container = mount(
        <TestProviders>
          <ValueListsModal showModal={true} onClose={jest.fn()} />
        </TestProviders>
      );

      act(() => {
        container
          .find('button[data-test-subj="action-delete-value-list"]')
          .first()
          .simulate('click');
        container.unmount();
      });

      expect(deleteListMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'some-list-id' }));
    });
  });
});
