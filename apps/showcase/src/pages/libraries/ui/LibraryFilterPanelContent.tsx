import {
  FilterSection,
  FilterSelectableOption,
} from '../../../components/filters';
import type { LibraryFilterSectionConfig } from '../../../features/libraries/libraryFilterSections';
import {
  isStatusFilterChipSelected,
  isTypeFilterChipSelected,
  type LibraryItemFilters,
  toggleStatusFilter,
  toggleTypeFilter,
} from '../../../features/libraries/libraryItemFilters';

export type LibraryFilterPanelContentProps = {
  draft: LibraryItemFilters;
  onDraftChange: (next: LibraryItemFilters) => void;
  sections: LibraryFilterSectionConfig[];
};

export function LibraryFilterPanelContent({
  draft,
  onDraftChange,
  sections,
}: LibraryFilterPanelContentProps) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <FilterSection
          key={section.id}
          sectionId={section.id}
          title={section.sectionLabel}
        >
          {section.id === 'status'
            ? section.options.map((option) => (
                <FilterSelectableOption
                  key={option.id}
                  isSelected={isStatusFilterChipSelected(draft, option.id)}
                  label={option.label}
                  onToggle={() =>
                    onDraftChange(toggleStatusFilter(draft, option.id))
                  }
                />
              ))
            : section.options.map((option) => (
                <FilterSelectableOption
                  key={option.id}
                  isSelected={isTypeFilterChipSelected(draft, option.id)}
                  label={option.label}
                  onToggle={() =>
                    onDraftChange(toggleTypeFilter(draft, option.id))
                  }
                />
              ))}
        </FilterSection>
      ))}
    </div>
  );
}
