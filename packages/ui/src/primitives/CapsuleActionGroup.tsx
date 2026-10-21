import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type Ref,
} from 'react';

import { classNames } from '../className';
import { CountBadge } from './CountBadge';
import { Icon, type IconName } from './Icon';
import {
  LiquidActionGroup,
  LiquidActionGroupButton,
  LiquidActionGroupSurface,
} from './LiquidActionGroup';

export type CapsuleActionTone = 'default' | 'destructive';

export interface CapsuleActionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  'aria-label': string;
}

export interface CapsuleActionSearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'type' | 'ref'
> {
  'aria-label': string;
}

export interface CapsuleActionGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  cancelButtonProps?: CapsuleActionButtonProps;
  expanded?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  leadingBadgeCount?: number;
  leadingBadgeMax?: number;
  leadingButtonProps?: CapsuleActionButtonProps;
  leadingIconName?: IconName;
  leadingTone?: CapsuleActionTone;
  primaryBadgeCount?: number;
  primaryBadgeMax?: number;
  primaryIconName?: IconName;
  previewBadgeCount?: number;
  previewBadgeMax?: number;
  previewButtonProps?: CapsuleActionButtonProps;
  previewIconName?: IconName;
  previewImageSrc?: string;
  previewInitial?: string;
  searchButtonProps?: CapsuleActionButtonProps;
  searchInputProps?: CapsuleActionSearchInputProps;
}

const CapsuleActionGroup = forwardRef<HTMLDivElement, CapsuleActionGroupProps>(
  function CapsuleActionGroup(
    {
      cancelButtonProps,
      className = '',
      expanded = false,
      inputRef,
      leadingBadgeCount,
      leadingBadgeMax,
      leadingButtonProps,
      leadingIconName,
      leadingTone = 'default',
      primaryBadgeCount,
      primaryBadgeMax,
      primaryIconName = 'search',
      previewBadgeCount,
      previewBadgeMax,
      previewButtonProps,
      previewIconName,
      previewImageSrc,
      previewInitial,
      searchButtonProps,
      searchInputProps,
      ...props
    },
    ref,
  ) {
    const {
      className: leadingButtonClassName = '',
      disabled: leadingDisabled = false,
      ...leadingProps
    } = leadingButtonProps ?? { 'aria-label': '' };
    const {
      className: searchButtonClassName = '',
      disabled: searchDisabled = false,
      ...searchProps
    } = searchButtonProps ?? { 'aria-label': '' };
    const {
      className: previewButtonClassName = '',
      disabled: previewDisabled = false,
      ...previewProps
    } = previewButtonProps ?? { 'aria-label': '' };
    const {
      className: cancelButtonClassName = '',
      disabled: cancelDisabled = false,
      ...cancelProps
    } = cancelButtonProps ?? { 'aria-label': '' };
    const { className: searchInputClassName = '', ...searchInputRest } =
      searchInputProps ?? { 'aria-label': '' };

    const hasSearchInput = searchInputProps !== undefined;
    const isIconOnlyPrimary =
      searchButtonProps !== undefined && !hasSearchInput;
    const hasPrimarySurface =
      isIconOnlyPrimary ||
      searchButtonProps !== undefined ||
      searchInputProps !== undefined;
    const hasLeadingButton = leadingButtonProps !== undefined;
    const shouldRenderLeadingButton =
      hasLeadingButton && !(expanded && hasSearchInput);
    const hasPreviewButton = previewButtonProps !== undefined;
    const trailingIsCancel = expanded && Boolean(cancelButtonProps);
    const shouldRenderTrailingButton = hasPreviewButton || trailingIsCancel;
    const actionCount =
      Number(shouldRenderLeadingButton) +
      Number(hasPrimarySurface) +
      Number(shouldRenderTrailingButton);
    const hasSingleAction = actionCount === 1;
    const trailingButtonProps = trailingIsCancel ? cancelProps : previewProps;
    const trailingButtonClassName = trailingIsCancel
      ? cancelButtonClassName
      : previewButtonClassName;
    const trailingDisabled = trailingIsCancel
      ? cancelDisabled
      : previewDisabled;
    const trailingVariant =
      !trailingIsCancel && previewIconName ? 'primary' : 'control';
    const trailingMatchesSearch = !trailingIsCancel && Boolean(previewIconName);
    const shouldRenderPreviewSurface =
      !trailingIsCancel || Boolean(previewImageSrc || previewInitial);
    const liquidState = expanded ? 'separated' : 'joined';
    const shouldRenderPrimaryBadge = !expanded;
    const shouldRenderLeadingBadge = !expanded;
    const shouldRenderPreviewBadge = !trailingIsCancel;
    const primaryIcon = (
      <span
        className="vui-capsule-action-group__search-icon vui-count-badge-anchor"
        aria-hidden="true"
      >
        <Icon name={primaryIconName} size={22} strokeWidth={2.2} />
        {shouldRenderPrimaryBadge ? (
          <CountBadge count={primaryBadgeCount} max={primaryBadgeMax} />
        ) : null}
      </span>
    );

    return (
      <LiquidActionGroup
        ref={ref}
        className={classNames('vui-capsule-action-group', className)}
        data-action-count={String(actionCount)}
        data-expanded={expanded ? 'true' : 'false'}
        data-has-leading={shouldRenderLeadingButton ? 'true' : 'false'}
        data-has-trailing={shouldRenderTrailingButton ? 'true' : 'false'}
        data-single-action={hasSingleAction ? 'true' : 'false'}
        state={liquidState}
        {...props}
      >
        {shouldRenderLeadingButton && leadingIconName ? (
          <LiquidActionGroupButton
            className={classNames(
              'vui-capsule-action-group__leading',
              'vui-capsule-action-group__search',
              leadingButtonClassName,
            )}
            data-tone={leadingTone}
            disabled={leadingDisabled}
            state={liquidState}
            type="button"
            variant="primary"
            {...leadingProps}
          >
            <span
              className="vui-capsule-action-group__search-icon vui-count-badge-anchor"
              aria-hidden="true"
            >
              <Icon name={leadingIconName} size={22} strokeWidth={2.2} />
              {shouldRenderLeadingBadge ? (
                <CountBadge count={leadingBadgeCount} max={leadingBadgeMax} />
              ) : null}
            </span>
          </LiquidActionGroupButton>
        ) : null}
        {isIconOnlyPrimary ? (
          <LiquidActionGroupButton
            className={classNames(
              'vui-capsule-action-group__primary',
              'vui-capsule-action-group__search',
              searchButtonClassName,
            )}
            disabled={searchDisabled}
            state={liquidState}
            type="button"
            variant="primary"
            {...searchProps}
          >
            {primaryIcon}
          </LiquidActionGroupButton>
        ) : hasPrimarySurface ? (
          <LiquidActionGroupSurface
            className={classNames(
              'vui-capsule-action-group__search',
              expanded && 'vui-capsule-action-group__search--expanded',
            )}
            state={liquidState}
            variant="primary"
          >
            {primaryIcon}
            {searchInputProps ? (
              <input
                ref={inputRef}
                className={classNames(
                  'vui-capsule-action-group__input',
                  searchInputClassName,
                )}
                tabIndex={expanded ? 0 : -1}
                aria-hidden={expanded ? undefined : true}
                enterKeyHint="search"
                type="search"
                {...searchInputRest}
              />
            ) : null}
            {searchButtonProps ? (
              <button
                className={classNames(
                  'vui-capsule-action-group__search-trigger',
                  searchButtonClassName,
                )}
                disabled={searchDisabled}
                tabIndex={expanded ? -1 : 0}
                aria-hidden={expanded ? true : undefined}
                type="button"
                {...searchProps}
              />
            ) : null}
          </LiquidActionGroupSurface>
        ) : null}
        {shouldRenderTrailingButton ? (
          <LiquidActionGroupButton
            className={classNames(
              'vui-capsule-action-group__trailing',
              trailingMatchesSearch && 'vui-capsule-action-group__search',
              trailingIsCancel && 'vui-capsule-action-group__trailing--cancel',
              trailingButtonClassName,
            )}
            disabled={trailingDisabled}
            state={trailingIsCancel ? 'separated' : 'joined'}
            type="button"
            variant={trailingVariant}
            {...trailingButtonProps}
          >
            {previewIconName && !trailingIsCancel ? (
              <span
                className="vui-capsule-action-group__search-icon vui-count-badge-anchor"
                aria-hidden="true"
              >
                <Icon name={previewIconName} size={22} strokeWidth={2.2} />
                {shouldRenderPreviewBadge ? (
                  <CountBadge count={previewBadgeCount} max={previewBadgeMax} />
                ) : null}
              </span>
            ) : shouldRenderPreviewSurface ? (
              <span
                className="vui-capsule-action-group__preview"
                aria-hidden={trailingIsCancel ? true : undefined}
                data-visible={trailingIsCancel ? 'false' : 'true'}
              >
                {previewImageSrc ? (
                  <img
                    alt=""
                    className="vui-capsule-action-group__preview-image"
                    src={previewImageSrc}
                  />
                ) : (
                  <span className="vui-capsule-action-group__preview-initial">
                    {(previewInitial ?? '').slice(0, 1).toUpperCase()}
                  </span>
                )}
              </span>
            ) : null}
            <span
              className="vui-capsule-action-group__cancel-icon"
              aria-hidden="true"
              data-visible={trailingIsCancel ? 'true' : 'false'}
            >
              <Icon name="x" size={20} strokeWidth={2.4} />
            </span>
          </LiquidActionGroupButton>
        ) : null}
      </LiquidActionGroup>
    );
  },
);

CapsuleActionGroup.displayName = 'CapsuleActionGroup';

export { CapsuleActionGroup };
