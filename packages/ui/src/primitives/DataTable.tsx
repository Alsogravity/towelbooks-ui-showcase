import { type ReactNode } from 'react';

import { classNames } from '../className';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';

export interface DataTableColumn<T> {
  cellClassName?: string;
  icon?: IconName;
  key: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
  widthClassName?: string;
}

export interface DataTableProps<T> {
  ariaLabel: string;
  className?: string;
  columns: readonly DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  rows: readonly T[];
  tableClassName?: string;
}

export function DataTable<T>({
  ariaLabel,
  className = '',
  columns,
  getRowKey,
  rows,
  tableClassName = '',
}: DataTableProps<T>) {
  return (
    <Card
      padding={false}
      className={classNames('vui-data-table__surface', className)}
    >
      <div className="vui-data-table__scroll">
        <table
          aria-label={ariaLabel}
          className={classNames('vui-data-table', tableClassName)}
        >
          <thead className="vui-data-table__head">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={classNames(
                    'vui-data-table__head-cell',
                    column.widthClassName,
                  )}
                  scope="col"
                >
                  <span className="vui-data-table__head-label">
                    {column.icon ? (
                      <Icon
                        name={column.icon}
                        size={14}
                        className="vui-data-table__head-icon"
                      />
                    ) : null}
                    <span>{column.label}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="vui-data-table__body">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="vui-data-table__row">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={classNames(
                      'vui-data-table__cell',
                      column.cellClassName,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
