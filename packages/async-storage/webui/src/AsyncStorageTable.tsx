import { DeleteOutlined, PlusOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Flex, Input, Table } from 'antd';
import React, { Reducer, useEffect, useReducer, useState } from 'react';
import { usePluginStore } from './usePluginStore';

export function AsyncStorageTable() {
  const { entries, update, set, remove, ready } = usePluginStore(console.error);

  const { message } = App.useApp();

  const [initialUpdate, setInitialUpdate] = useState(false);
  useEffect(() => {
    if (!initialUpdate && ready) {
      update()
        .then(() => setInitialUpdate(true))
        .catch(console.error);
    }
  }, [initialUpdate, ready]);

  // 'set', 'replace'
  const [inProgressEdits, updateInProgressEdits] = useReducer<
    Reducer<Record<string, string | null>, Record<string, string | null> | 'clear'>
  >((state, payload) => {
    if (payload === 'clear') {
      return {};
    }
    return {
      ...state,
      ...payload,
    };
  }, {});

  return (
    <Table
      dataSource={entries}
      pagination={false}
      columns={[
        { title: 'Key', dataIndex: 'key', key: 'key' },
        {
          title: 'Value',
          dataIndex: 'key',
          key: 'value',
          render(key) {
            return (
              <Input.TextArea
                value={
                  inProgressEdits[key] ?? entries.find((entry) => entry.key === key)?.value ?? ''
                }
                onChange={(e) => {
                  updateInProgressEdits({ [key]: e.target.value });
                }}
                style={{
                  boxShadow: inProgressEdits[key] ? '0 0 0 2px #1890ff' : undefined,
                }}
              />
            );
          },
        },
        {
          title: 'Actions',
          key: 'key',
          render(value, record, index) {
            return (
              <Flex>
                <Button
                  onClick={() => remove(record.key).catch(console.error)}
                  icon={<DeleteOutlined />}
                />
                <Button
                  onClick={() => {
                    const value = inProgressEdits[record.key];
                    if (value) {
                      set(record.key, value).catch(console.error);
                    }
                  }}
                  icon={<SaveOutlined />}
                />
              </Flex>
            );
          },
        },
      ]}
      title={() => (
        <Flex align="center" justify="center" gap="0.5em">
          <h1>Async Storage Devtools</h1>
          <Button
            onClick={({ shiftKey }) => {
              if (shiftKey) {
                updateInProgressEdits('clear');
              }
              update().catch(console.error);
            }}
            icon={<ReloadOutlined />}
          />
          <Button
            onClick={() => {
              const key = prompt('Key');
              const value = prompt('Value');
              if (key && value) {
                set(key, value)
                  .then(() => update())
                  .catch(console.error);
              } else {
                message.error('Missing key or value');
              }
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      )}
      caption={
        <p>
          By default, the reload button will not update any fields you have edited (even if they
          have been saved!). To fully update the list, click the reload button while holding the{' '}
          <code>Shift</code> key.
        </p>
      }
    />
  );
}